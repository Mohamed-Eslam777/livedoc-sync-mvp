from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, AssistanceRequest, Offer


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom admin interface for the User model.
    """
    
    # Fields to display in the user list
    list_display = [
        'email', 'full_name', 'role', 'is_active', 
        'is_verified', 'is_staff', 'reliability_score', 'created_at'
    ]
    
    list_filter = ['role', 'is_active', 'is_verified', 'is_staff', 'is_superuser']
    
    search_fields = ['email', 'full_name', 'phone_number']
    
    ordering = ['-created_at']
    
    # Fieldsets for the user detail/edit page
    fieldsets = (
        (None, {
            'fields': ('email', 'password')
        }),
        (_('Personal Info'), {
            'fields': ('full_name', 'phone_number', 'role')
        }),
        (_('Location'), {
            'fields': ('latitude', 'longitude'),
            'classes': ('collapse',),  # Collapsible section
        }),
        (_('Permissions'), {
            'fields': (
                'is_active', 'is_staff', 'is_superuser', 
                'is_verified', 'groups', 'user_permissions'
            ),
        }),
        (_('Platform Stats'), {
            'fields': ('reliability_score',),
        }),
        (_('Important dates'), {
            'fields': ('last_login', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    # Fieldsets for adding a new user
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email', 'full_name', 'password1', 'password2',
                'role', 'is_active', 'is_staff', 'is_verified'
            ),
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'last_login']
    
    filter_horizontal = ['groups', 'user_permissions']


@admin.register(AssistanceRequest)
class AssistanceRequestAdmin(admin.ModelAdmin):
    """
    Admin interface for the AssistanceRequest model.
    """
    
    # Fields to display in the list view
    list_display = [
        'title', 'requester', 'status', 'assistance_type',
        'assigned_volunteer', 'scheduled_time', 'created_at'
    ]
    
    # Filters for the sidebar
    list_filter = [
        'status', 'assistance_type', 'created_at', 'scheduled_time'
    ]
    
    # Search fields
    search_fields = [
        'title', 'description', 'requester__full_name', 
        'requester__email', 'assigned_volunteer__full_name'
    ]
    
    # Default ordering
    ordering = ['-created_at']
    
    # Date hierarchy for easy navigation
    date_hierarchy = 'created_at'
    
    # Fieldsets for the detail/edit page
    fieldsets = (
        (_('Request Information'), {
            'fields': ('title', 'description', 'assistance_type')
        }),
        (_('People'), {
            'fields': ('requester', 'assigned_volunteer')
        }),
        (_('Status & Scheduling'), {
            'fields': ('status', 'scheduled_time')
        }),
        (_('Location'), {
            'fields': ('latitude', 'longitude')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    # Read-only fields
    readonly_fields = ['created_at', 'updated_at']
    
    # Auto-complete for foreign keys (improves performance)
    autocomplete_fields = ['requester', 'assigned_volunteer']
    
    # Actions
    actions = ['mark_as_accepted', 'mark_as_completed', 'mark_as_cancelled']
    
    def mark_as_accepted(self, request, queryset):
        """Mark selected requests as accepted."""
        updated = queryset.update(status=AssistanceRequest.ACCEPTED)
        self.message_user(request, f'{updated} request(s) marked as accepted.')
    mark_as_accepted.short_description = 'Mark selected as Accepted'
    
    def mark_as_completed(self, request, queryset):
        """Mark selected requests as completed."""
        updated = queryset.update(status=AssistanceRequest.COMPLETED)
        self.message_user(request, f'{updated} request(s) marked as completed.')
    mark_as_completed.short_description = 'Mark selected as Completed'
    
    def mark_as_cancelled(self, request, queryset):
        """Mark selected requests as cancelled."""
        updated = queryset.update(status=AssistanceRequest.CANCELLED)
        self.message_user(request, f'{updated} request(s) marked as cancelled.')
    mark_as_cancelled.short_description = 'Mark selected as Cancelled'


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    """Admin interface for the Offer model."""

    list_display = [
        'id', 'volunteer', 'request', 'status',
        'proposed_time', 'created_at',
    ]

    list_filter = ['status', 'created_at', 'proposed_time']

    search_fields = [
        'volunteer__full_name', 'volunteer__email',
        'request__title', 'message',
    ]

    ordering = ['-created_at']
    date_hierarchy = 'created_at'

    fieldsets = (
        (_('Offer Details'), {
            'fields': ('request', 'volunteer', 'message', 'proposed_time'),
        }),
        (_('Status'), {
            'fields': ('status',),
        }),
        (_('Timestamps'), {
            'fields': ('created_at',),
            'classes': ('collapse',),
        }),
    )

    readonly_fields = ['created_at']
    autocomplete_fields = ['request', 'volunteer']

    actions = ['accept_offers', 'reject_offers', 'withdraw_offers']

    def accept_offers(self, request, queryset):
        """Accept selected offers."""
        for offer in queryset.filter(status=Offer.PENDING):
            offer.status = Offer.ACCEPTED
            offer.save()  # triggers request status update
        self.message_user(request, 'Selected offers accepted.')
    accept_offers.short_description = 'Accept selected offers'

    def reject_offers(self, request, queryset):
        """Reject selected offers."""
        updated = queryset.filter(status=Offer.PENDING).update(status=Offer.REJECTED)
        self.message_user(request, f'{updated} offer(s) rejected.')
    reject_offers.short_description = 'Reject selected offers'

    def withdraw_offers(self, request, queryset):
        """Withdraw selected offers."""
        updated = queryset.filter(status=Offer.PENDING).update(status=Offer.WITHDRAWN)
        self.message_user(request, f'{updated} offer(s) withdrawn.')
    withdraw_offers.short_description = 'Withdraw selected offers'
