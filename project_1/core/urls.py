"""
URL configuration for core app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from core.views import AssistanceRequestViewSet, RegisterView, OfferViewSet

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'requests', AssistanceRequestViewSet, basename='assistancerequest')
router.register(r'offers', OfferViewSet, basename='offer')

# The API URLs are now determined automatically by the router
urlpatterns = [
    # Authentication endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Router URLs (includes /requests/ and /requests/{id}/recommendations/)
    path('', include(router.urls)),
]
