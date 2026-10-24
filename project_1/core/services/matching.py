"""
Volunteer Matching Service

This module contains the AI-powered matching engine that recommends
volunteers to assistance requests based on proximity and reliability.
"""

import math
from typing import List, Tuple, Optional
from django.db.models import QuerySet
from core.models import User, AssistanceRequest


class VolunteerMatchingService:
    """
    Service class for matching volunteers to assistance requests.
    
    Uses a weighted scoring algorithm that considers:
    - Geographic proximity (60% weight)
    - Volunteer reliability score (40% weight)
    """
    
    # Scoring weights (must sum to 1.0)
    DISTANCE_WEIGHT = 0.6
    RELIABILITY_WEIGHT = 0.4
    
    @staticmethod
    def recommend_volunteers(
        request_instance: AssistanceRequest,
        limit: int = 3
    ) -> List[Tuple[User, float]]:
        """
        Recommend the best-matched volunteers for an assistance request.
        
        Args:
            request_instance: The AssistanceRequest needing volunteer assignment
            limit: Maximum number of volunteers to recommend (default: 3)
        
        Returns:
            List of tuples (User, final_score) sorted by score descending.
            Empty list if no suitable volunteers found or invalid input.
        
        Algorithm:
            1. Validate request location
            2. Filter eligible volunteers (VOLUNTEER role, active, verified, has location)
            3. Calculate distance score using Euclidean distance
            4. Normalize both distance and reliability scores to 0-1 range
            5. Compute final score: (0.6 * distance_score) + (0.4 * reliability_score)
            6. Sort by final score descending and return top N
        
        Note:
            - Closer distance results in higher score (inverse relationship)
            - Currently uses simple Euclidean distance (will integrate Google Maps API later)
            - Returns empty list if limit is zero or negative
        """
        # Validate limit parameter
        if limit <= 0:
            return []
        
        # Validate request location - cannot match without valid coordinates
        if request_instance.latitude is None or request_instance.longitude is None:
            return []
        
        # Get eligible volunteers (evaluated once and converted to list)
        eligible_volunteers = list(VolunteerMatchingService._get_eligible_volunteers())
        
        # Early return if no volunteers available
        if not eligible_volunteers:
            return []
        
        # Calculate scores for each volunteer
        volunteer_scores: List[dict] = []
        
        for volunteer in eligible_volunteers:
            # Calculate distance score
            distance = VolunteerMatchingService._calculate_distance(
                request_instance.latitude,
                request_instance.longitude,
                volunteer.latitude,
                volunteer.longitude
            )
            
            # Handle None reliability_score - treat as 0.0
            reliability = volunteer.reliability_score if volunteer.reliability_score is not None else 0.0
            
            # Store volunteer with raw scores for normalization
            volunteer_scores.append({
                'volunteer': volunteer,
                'distance': distance,
                'reliability': reliability
            })
        
        # Normalize and calculate final scores
        scored_volunteers = VolunteerMatchingService._calculate_final_scores(
            volunteer_scores
        )
        
        # Sort by final score descending and return top N
        scored_volunteers.sort(key=lambda x: x[1], reverse=True)
        
        return scored_volunteers[:limit]
    
    @staticmethod
    def _get_eligible_volunteers() -> QuerySet:
        """
        Get all eligible volunteers for assignment.
        
        Returns:
            QuerySet of User objects that meet eligibility criteria:
            - role = VOLUNTEER
            - is_active = True
            - is_verified = True
            - Has valid location (latitude and longitude not null)
        """
        return User.objects.filter(
            role=User.VOLUNTEER,
            is_active=True,
            is_verified=True,
            latitude__isnull=False,
            longitude__isnull=False
        )
    
    @staticmethod
    def _calculate_distance(
        lat1: float,
        lon1: float,
        lat2: float,
        lon2: float
    ) -> float:
        """
        Calculate Euclidean distance between two geographic points.
        
        Args:
            lat1: Latitude of first point
            lon1: Longitude of first point
            lat2: Latitude of second point
            lon2: Longitude of second point
        
        Returns:
            Euclidean distance between the two points
        
        Note:
            This is a simple distance calculation for initial implementation.
            Will be replaced with Haversine formula or Google Maps Distance Matrix API
            for production use to get accurate real-world distances.
        """
        return math.sqrt((lat2 - lat1) ** 2 + (lon2 - lon1) ** 2)
    
    @staticmethod
    def _normalize_scores(values: List[float]) -> List[float]:
        """
        Normalize a list of values to 0-1 range using min-max normalization.
        
        Args:
            values: List of numeric values to normalize
        
        Returns:
            List of normalized values in range [0, 1]
            Returns list of 0.5 values if all values are the same
        
        Note:
            When all values are equal, there's no variance to normalize.
            We return 0.5 (middle value) to avoid division by zero and to
            ensure fair treatment - all volunteers get equal score for this metric.
        """
        if not values:
            return []
        
        min_val: float = min(values)
        max_val: float = max(values)
        
        # Handle case where all values are the same
        # This prevents division by zero and ensures fair scoring
        # when there's no variance in the metric (e.g., all volunteers
        # have same reliability score or are equidistant)
        if max_val == min_val:
            return [0.5] * len(values)
        
        # Min-max normalization: (value - min) / (max - min)
        return [(val - min_val) / (max_val - min_val) for val in values]
    
    @staticmethod
    def _calculate_final_scores(
        volunteer_scores: List[dict]
    ) -> List[Tuple[User, float]]:
        """
        Calculate final weighted scores for all volunteers.
        
        Args:
            volunteer_scores: List of dicts containing volunteer, distance, and reliability
        
        Returns:
            List of tuples (User, final_score)
        
        Algorithm:
            1. Extract and normalize distance scores (inverse: lower distance = higher score)
            2. Extract and normalize reliability scores
            3. Normalize weights to ensure they sum to 1.0
            4. Compute weighted final score for each volunteer
        """
        if not volunteer_scores:
            return []
        
        # Ensure weights sum to 1.0 (defensive programming)
        weight_sum: float = VolunteerMatchingService.DISTANCE_WEIGHT + VolunteerMatchingService.RELIABILITY_WEIGHT
        
        # Normalize weights if they don't sum to 1.0
        if abs(weight_sum - 1.0) > 1e-9:  # Use small epsilon for float comparison
            distance_weight = VolunteerMatchingService.DISTANCE_WEIGHT / weight_sum
            reliability_weight = VolunteerMatchingService.RELIABILITY_WEIGHT / weight_sum
        else:
            distance_weight = VolunteerMatchingService.DISTANCE_WEIGHT
            reliability_weight = VolunteerMatchingService.RELIABILITY_WEIGHT
        
        # Extract raw scores
        distances: List[float] = [v['distance'] for v in volunteer_scores]
        reliabilities: List[float] = [v['reliability'] for v in volunteer_scores]
        
        # Normalize distance scores (inverse: closer = higher score)
        normalized_distances: List[float] = VolunteerMatchingService._normalize_scores(distances)
        # Invert distance scores so closer distance gets higher score
        inverted_distances: List[float] = [1 - d for d in normalized_distances]
        
        # Normalize reliability scores
        normalized_reliabilities: List[float] = VolunteerMatchingService._normalize_scores(reliabilities)
        
        # Calculate final weighted scores
        final_scores: List[Tuple[User, float]] = []
        for i, score_data in enumerate(volunteer_scores):
            final_score: float = (
                distance_weight * inverted_distances[i] +
                reliability_weight * normalized_reliabilities[i]
            )
            final_scores.append((score_data['volunteer'], final_score))
        
        return final_scores
