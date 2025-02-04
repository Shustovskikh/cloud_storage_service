from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, RegisterUserView, CustomTokenObtainPairView
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)

router = DefaultRouter()
router.register(r'', UserViewSet, basename='user')

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register_user'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
]

urlpatterns += router.urls
