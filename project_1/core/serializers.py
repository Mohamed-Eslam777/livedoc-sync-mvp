"""
Serializers for the core application.
"""

from rest_framework import serializers
from core.models import User, AssistanceRequest, Offer


class VolunteerRecommendationSerializer(serializers.Serializer):
    """
    Serializer for volunteer recommendations.
    
    Returns volunteer information along with their matching score
    for a specific assistance request.
    """
    id = serializers.IntegerField(read_only=True)
    full_name = serializers.CharField(read_only=True)
    reliability_score = serializers.FloatField(read_only=True)
    final_score = serializers.FloatField(read_only=True)
    
    def to_representation(self, instance):
        """
        Custom representation to handle the tuple format (User, score).
        
        Args:
            instance: Tuple of (User, final_score)
        
        Returns:
            Dictionary with volunteer data and final score
        """
        # Instance is a tuple: (User, final_score)
        volunteer, final_score = instance
        
        return {
            'id': volunteer.id,
            'full_name': volunteer.full_name,
            'reliability_score': volunteer.reliability_score,
            'final_score': round(final_score, 4)  # Round to 4 decimal places
        }


class AssistanceRequestSerializer(serializers.ModelSerializer):
    """
    Serializer for AssistanceRequest model.
    """
    requester_name = serializers.CharField(source='requester.full_name', read_only=True)
    assigned_volunteer_name = serializers.CharField(
        source='assigned_volunteer.full_name', 
        read_only=True, 
        allow_null=True
    )
    
    class Meta:
        model = AssistanceRequest
        fields = [
            'id', 'title', 'description', 'assistance_type', 'status',
            'requester', 'requester_name', 'assigned_volunteer', 'assigned_volunteer_name',
            'scheduled_time', 'latitude', 'longitude', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    
    Allows registration of DISABLED or VOLUNTEER users only.
    Admins can only be created via Django admin or createsuperuser command.
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        min_length=6,
        help_text='Password must be at least 6 characters long'
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        help_text='Confirm your password'
    )
    
    class Meta:
        model = User
        fields = ['email', 'full_name', 'password', 'password_confirm', 'role', 'phone_number']
        extra_kwargs = {
            'email': {'required': True},
            'full_name': {'required': True},
            'role': {'required': True},
        }
    
    def validate_role(self, value):
        """
        Validate that role is either DISABLED or VOLUNTEER.
        ADMIN role can only be created by superuser.
        """
        if value not in [User.DISABLED, User.VOLUNTEER]:
            raise serializers.ValidationError(
                'Invalid role. Only DISABLED or VOLUNTEER roles are allowed for registration.'
            )
        return value
    
    def validate(self, attrs):
        """
        Validate that passwords match.
        """
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match.'
            })
        return attrs
    
    def create(self, validated_data):
        """
        Create a new user with hashed password.
        """
        # Remove password_confirm as it's not needed for user creation
        validated_data.pop('password_confirm')
        
        # Extract password
        password = validated_data.pop('password')
        
        # Create user instance
        user = User(**validated_data)
        
        # Hash and set password
        user.set_password(password)
        
        # Save user
        user.save()
        
        return user


class OfferSerializer(serializers.ModelSerializer):
    """
    Serializer for the Offer model.
    """
    volunteer_name = serializers.CharField(source='volunteer.full_name', read_only=True)
    request_title = serializers.CharField(source='request.title', read_only=True)

    class Meta:
        model = Offer
        fields = [
            'id', 'request', 'request_title',
            'volunteer', 'volunteer_name',
            'message', 'proposed_time',
            'status', 'created_at',
        ]
        read_only_fields = ['id', 'volunteer', 'status', 'created_at']

    def create(self, validated_data):
        """Auto-set the volunteer from the authenticated user."""
        validated_data['volunteer'] = self.context['request'].user
        return super().create(validated_data)
