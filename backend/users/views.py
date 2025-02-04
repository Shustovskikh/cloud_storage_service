from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import CustomUser
from .serializers import UserSerializer, CustomTokenObtainPairSerializer
import logging

logger = logging.getLogger(__name__)

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom token view to use the modified serializer.
    This view will return the standard access and refresh tokens, 
    but will also include additional user information, such as 'is_staff'.
    """
    serializer_class = CustomTokenObtainPairSerializer


class UserViewSet(ModelViewSet):
    """
    ViewSet for managing users.
    Regular users can only see themselves, and administrators can see all users.
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Ensure fresh data is retrieved each time.
        Regular users can only see themselves, administrators can see everyone.
        """
        user = self.request.user
        if user.is_staff:
            users = CustomUser.objects.all()
        else:
            users = CustomUser.objects.filter(id=user.id)
        logger.debug(f"Fetched users: {users}")
        return users

    def finalize_response(self, request, response, *args, **kwargs):
        """
        Add no-cache headers to the response to prevent caching.
        """
        response['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        return super().finalize_response(request, response, *args, **kwargs)

    def perform_destroy(self, instance):
        """
        Override to ensure cache is cleared after user deletion.
        """
        super().perform_destroy(instance)
        from django.core.cache import cache
        cache.clear()


class RegisterUserView(APIView):
    """
    View to register a new user. 
    This is a public API endpoint, so permission is set to AllowAny.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        """
        Handle user registration by accepting the user data and creating a new user.
        """
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return self.add_no_cache_headers(Response(serializer.data, status=status.HTTP_201_CREATED))
        return self.add_no_cache_headers(Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST))

    def add_no_cache_headers(self, response):
        """
        Add no-cache headers to the response.
        """
        response['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        return response
