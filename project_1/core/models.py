from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils.translation import gettext_lazy as _


class CustomUserManager(BaseUserManager):
    """
    Custom user manager where email is the unique identifier
    for authentication instead of username.
    """
    
    def create_user(self, email, full_name, password=None, **extra_fields):
        """
        Create and save a regular user with the given email, full_name, and password.
        """
        if not email:
            raise ValueError(_('The Email field must be set'))
        if not full_name:
            raise ValueError(_('The Full Name field must be set'))
        
        email = self.normalize_email(email)
        user = self.model(email=email, full_name=full_name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, full_name, password=None, **extra_fields):
        """
        Create and save a superuser with the given email, full_name, and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_verified', True)
        extra_fields.setdefault('role', 'ADMIN')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        
        return self.create_user(email, full_name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model for Saned platform.
    Users can be people with disabilities, volunteers, or admins.
    """
    
    # Role choices
    DISABLED = 'DISABLED'
    VOLUNTEER = 'VOLUNTEER'
    ADMIN = 'ADMIN'
    
    ROLE_CHOICES = [
        (DISABLED, 'Person with Disability'),
        (VOLUNTEER, 'Volunteer'),
        (ADMIN, 'Administrator'),
    ]
    
    # Core fields
    email = models.EmailField(
        _('email address'),
        unique=True,
        error_messages={
            'unique': _('A user with that email already exists.'),
        },
    )
    full_name = models.CharField(_('full name'), max_length=255)
    phone_number = models.CharField(_('phone number'), max_length=20, blank=True, null=True)
    
    # User type and permissions
    role = models.CharField(
        _('role'),
        max_length=10,
        choices=ROLE_CHOICES,
        default=DISABLED,
    )
    is_active = models.BooleanField(_('active'), default=True)
    is_staff = models.BooleanField(_('staff status'), default=False)
    is_verified = models.BooleanField(_('verified'), default=False)
    
    # Platform-specific fields
    reliability_score = models.FloatField(
        _('reliability score'),
        default=0.0,
        help_text=_('User reliability score based on platform interactions')
    )
    
    # Location fields for matching volunteers with people needing help
    latitude = models.FloatField(_('latitude'), null=True, blank=True)
    longitude = models.FloatField(_('longitude'), null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    # Set custom manager
    objects = CustomUserManager()
    
    # Use email as the unique identifier
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']
    
    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.full_name} ({self.email})"
    
    def get_full_name(self):
        """Return the full name for the user."""
        return self.full_name
    
    def get_short_name(self):
        """Return the short name for the user."""
        return self.full_name.split()[0] if self.full_name else self.email


class AssistanceRequest(models.Model):
    """
    Model representing an assistance request from a person with disability
    to be fulfilled by a volunteer.
    """
    
    # Status choices
    PENDING = 'PENDING'
    ACCEPTED = 'ACCEPTED'
    IN_PROGRESS = 'IN_PROGRESS'
    COMPLETED = 'COMPLETED'
    CANCELLED = 'CANCELLED'
    
    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (ACCEPTED, 'Accepted'),
        (IN_PROGRESS, 'In Progress'),
        (COMPLETED, 'Completed'),
        (CANCELLED, 'Cancelled'),
    ]
    
    # Core fields
    requester = models.ForeignKey(
        'User',
        on_delete=models.CASCADE,
        related_name='requests',
        help_text=_('Person with disability requesting assistance')
    )
    title = models.CharField(_('title'), max_length=255)
    description = models.TextField(_('description'))
    assistance_type = models.CharField(
        _('assistance type'),
        max_length=100,
        help_text=_('Type of assistance needed (e.g., mobility, reading, shopping)')
    )
    
    # Status and assignment
    status = models.CharField(
        _('status'),
        max_length=12,
        choices=STATUS_CHOICES,
        default=PENDING,
    )
    assigned_volunteer = models.ForeignKey(
        'User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_requests',
        help_text=_('Volunteer assigned to fulfill this request')
    )
    
    # Scheduling and location
    scheduled_time = models.DateTimeField(
        _('scheduled time'),
        help_text=_('When the assistance is needed')
    )
    latitude = models.FloatField(_('latitude'))
    longitude = models.FloatField(_('longitude'))
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('assistance request')
        verbose_name_plural = _('assistance requests')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['requester', '-created_at']),
            models.Index(fields=['assigned_volunteer', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.get_status_display()} ({self.requester.full_name})"
    
    def clean(self):
        """
        Validate that requester has DISABLED role and assigned_volunteer has VOLUNTEER role.
        """
        from django.core.exceptions import ValidationError
        
        # Validate requester role
        if self.requester and self.requester.role != User.DISABLED:
            raise ValidationError({
                'requester': _('Requester must be a person with disability.')
            })
        
        # Validate assigned volunteer role
        if self.assigned_volunteer and self.assigned_volunteer.role != User.VOLUNTEER:
            raise ValidationError({
                'assigned_volunteer': _('Assigned volunteer must have the VOLUNTEER role.')
            })
    
    def save(self, *args, **kwargs):
        """Override save to run validation."""
        self.clean()
        super().save(*args, **kwargs)


class Offer(models.Model):
    """
    An offer from a volunteer to fulfill an assistance request.
    Part of the marketplace matching workflow.
    """

    PENDING = 'PENDING'
    ACCEPTED = 'ACCEPTED'
    REJECTED = 'REJECTED'
    WITHDRAWN = 'WITHDRAWN'

    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (ACCEPTED, 'Accepted'),
        (REJECTED, 'Rejected'),
        (WITHDRAWN, 'Withdrawn'),
    ]

    request = models.ForeignKey(
        AssistanceRequest,
        on_delete=models.CASCADE,
        related_name='offers',
        help_text=_('The assistance request this offer is for'),
    )
    volunteer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='offers',
        help_text=_('Volunteer making the offer'),
    )
    message = models.TextField(
        _('message'),
        help_text=_('Message from the volunteer to the requester'),
    )
    proposed_time = models.DateTimeField(
        _('proposed time'),
        help_text=_('When the volunteer proposes to provide assistance'),
    )
    status = models.CharField(
        _('status'),
        max_length=10,
        choices=STATUS_CHOICES,
        default=PENDING,
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)

    class Meta:
        verbose_name = _('offer')
        verbose_name_plural = _('offers')
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['request', 'volunteer'],
                name='unique_offer_per_volunteer_per_request',
            ),
        ]
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['volunteer', '-created_at']),
            models.Index(fields=['request', 'status']),
        ]

    def __str__(self):
        return f"Offer by {self.volunteer.full_name} for '{self.request.title}' ({self.get_status_display()})"

    def clean(self):
        from django.core.exceptions import ValidationError

        # Only volunteers can create offers
        if self.volunteer_id and self.volunteer.role != User.VOLUNTEER:
            raise ValidationError({
                'volunteer': _('Only users with the VOLUNTEER role can create offers.'),
            })

        # Cannot offer on a request that is no longer open
        if self.request_id and self.request.status not in (
            AssistanceRequest.PENDING,
            AssistanceRequest.ACCEPTED,
        ):
            raise ValidationError({
                'request': _('Offers can only be made on PENDING or ACCEPTED requests.'),
            })

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

        # When an offer is accepted, move the request to IN_PROGRESS
        if self.status == self.ACCEPTED:
            request_obj = self.request
            request_obj.status = AssistanceRequest.IN_PROGRESS
            request_obj.assigned_volunteer = self.volunteer
            request_obj.save(update_fields=['status', 'assigned_volunteer', 'updated_at'])

            # Reject all other pending offers for this request
            Offer.objects.filter(
                request=self.request,
                status=self.PENDING,
            ).exclude(pk=self.pk).update(status=self.REJECTED)
