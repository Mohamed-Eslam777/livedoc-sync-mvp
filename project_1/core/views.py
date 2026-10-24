"""
Views for the core application.
"""

from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404

from core.models import AssistanceRequest, Offer, User
from core.serializers import (
    AssistanceRequestSerializer,
    VolunteerRecommendationSerializer,
    RegisterSerializer,
    OfferSerializer,
)
from core.services.matching import VolunteerMatchingService


# ── Permissions ──────────────────────────────────────────────

class IsVolunteer(BasePermission):
    """Only users with role=VOLUNTEER can access."""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == User.VOLUNTEER
        )


# ── Registration ─────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    """
    API endpoint for user registration.

    POST /api/auth/register/

    Creates a new user account (DISABLED or VOLUNTEER role only)
    and returns user data with JWT access and refresh tokens.
    """
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        """
        Create a new user and return user data with JWT tokens.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Create the user
        user = serializer.save()

        # Generate JWT tokens for the user
        refresh = RefreshToken.for_user(user)

        # Prepare response data
        response_data = {
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'role': user.role,
                'phone_number': user.phone_number,
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }

        return Response(response_data, status=status.HTTP_201_CREATED)


# ── Assistance Requests ──────────────────────────────────────

class AssistanceRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing assistance requests.

    Provides CRUD operations for AssistanceRequest model plus
    additional actions for volunteer recommendations.
    """
    queryset = AssistanceRequest.objects.all()
    serializer_class = AssistanceRequestSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'], url_path='recommendations')
    def recommendations(self, request, pk=None):
        """
        Get volunteer recommendations for a specific assistance request.

        GET /api/requests/{id}/recommendations/

        Returns top recommended volunteers based on proximity and reliability.

        Query Parameters:
            limit (int, optional): Maximum number of recommendations (default: 3)

        Returns:
            200: List of recommended volunteers with scores
            404: Request not found

        Example Response:
            [
                {
                    "id": 5,
                    "full_name": "John Doe",
                    "reliability_score": 8.5,
                    "final_score": 0.8234
                },
                ...
            ]
        """
        # Get the assistance request (raises 404 if not found)
        assistance_request = get_object_or_404(AssistanceRequest, pk=pk)

        # Get limit from query params (default: 3)
        try:
            limit = int(request.query_params.get('limit', 3))
        except (ValueError, TypeError):
            limit = 3

        # Get volunteer recommendations using the matching service
        recommendations = VolunteerMatchingService.recommend_volunteers(
            request_instance=assistance_request,
            limit=limit
        )

        # Serialize the recommendations
        serializer = VolunteerRecommendationSerializer(
            recommendations,
            many=True
        )

        return Response(serializer.data, status=status.HTTP_200_OK)


# ── Offers ───────────────────────────────────────────────────

class OfferViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing volunteer offers.

    - Volunteers can create offers and view their own offers.
    - Disabled users can view offers for their own requests.
    - Custom action: POST /api/offers/{id}/accept/ (request owner only).
    """
    serializer_class = OfferSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter offers based on user role:
          - VOLUNTEER: only their own offers
          - DISABLED: offers for their own requests
          - ADMIN: all offers
        """
        user = self.request.user
        if user.role == User.VOLUNTEER:
            return Offer.objects.filter(volunteer=user).select_related(
                'request', 'volunteer'
            )
        elif user.role == User.DISABLED:
            return Offer.objects.filter(request__requester=user).select_related(
                'request', 'volunteer'
            )
        # Admin sees everything
        return Offer.objects.all().select_related('request', 'volunteer')

    def get_permissions(self):
        """Volunteers required for create; authenticated for everything else."""
        if self.action == 'create':
            return [IsAuthenticated(), IsVolunteer()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(volunteer=self.request.user)

    # ── Custom action: accept an offer ───────────────────────

    @action(detail=True, methods=['post'], url_path='accept')
    def accept(self, request, pk=None):
        """
        POST /api/offers/{id}/accept/

        Only the owner of the related AssistanceRequest can accept an offer.
        Sets offer.status → ACCEPTED which triggers:
          - request.status → IN_PROGRESS
          - request.assigned_volunteer set
          - other pending offers auto-rejected
        """
        offer = self.get_object()

        # Only the request owner can accept
        if offer.request.requester != request.user:
            return Response(
                {'detail': 'Only the request owner can accept offers.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Must be in PENDING state
        if offer.status != Offer.PENDING:
            return Response(
                {'detail': f'Cannot accept an offer with status {offer.get_status_display()}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        offer.status = Offer.ACCEPTED
        offer.save()  # triggers model-level side effects

        return Response(
            OfferSerializer(offer).data,
            status=status.HTTP_200_OK,
        )
