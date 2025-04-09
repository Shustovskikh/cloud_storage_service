from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet,
    RegisterUserView,
    UserLoginView,
    UserLogoutView,
    PasswordChangeView,
    UserProfileView
)

router = DefaultRouter()
router.register(r'', UserViewSet, basename='user')

urlpatterns = [
    # Authentication endpoints
    path('login/', UserLoginView.as_view(), name='user-login'),
    path('logout/', UserLogoutView.as_view(), name='user-logout'),

    # Registration endpoint
    path('register/', RegisterUserView.as_view(), name='user-register'),

    # Profile management
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', PasswordChangeView.as_view(), name='user-change-password'),
]

urlpatterns += router.urls
