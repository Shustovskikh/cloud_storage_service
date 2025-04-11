from django.contrib.auth import login, logout, update_session_auth_hash
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import SessionAuthentication
from django.conf import settings
from django.contrib.auth import get_user_model
from .serializers import (
    UserSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    PasswordChangeSerializer
)
import logging
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.utils.decorators import method_decorator

logger = logging.getLogger(__name__)
User = get_user_model()

class SecureResponseMixin:
    """Mixin for adding security headers to all API responses"""
    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        response['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        if not settings.DEBUG:
            response['X-Content-Type-Options'] = 'nosniff'
            response['X-Frame-Options'] = 'DENY'
        return response

@method_decorator(ensure_csrf_cookie, name='dispatch')
class UserLoginView(APIView, SecureResponseMixin):
    """Handle user authentication using session cookies"""
    permission_classes = [AllowAny]
    authentication_classes = [SessionAuthentication]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            logger.info(f"User {user.id} logged in")
            
            response = Response({
                'status': 'success',
                'user_id': user.id,
                'username': user.username,
                'is_staff': user.is_staff
            }, status=status.HTTP_200_OK)
            
            response.set_cookie(
                settings.SESSION_COOKIE_NAME,
                request.session.session_key,
                httponly=True,
                secure=not settings.DEBUG,
                samesite='Lax'
            )
            return response
            
        logger.warning(f"Login failed: {serializer.errors}")
        return Response({
            'status': 'error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_protect, name='dispatch')
class UserLogoutView(APIView, SecureResponseMixin):
    """Handle user logout and session termination"""
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication]

    def post(self, request):
        logger.info(f"User {request.user.id} logging out")
        logout(request)
        response = Response({
            'status': 'success',
            'message': 'Logged out successfully'
        }, status=status.HTTP_200_OK)
        response.delete_cookie(settings.SESSION_COOKIE_NAME)
        return response

@method_decorator(ensure_csrf_cookie, name='dispatch')
class RegisterUserView(APIView, SecureResponseMixin):
    """Handle new user registration"""
    permission_classes = [AllowAny]
    authentication_classes = [SessionAuthentication]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            login(request, user)
            logger.info(f"New user registered: {user.id}")
            
            response = Response({
                'status': 'success',
                'user_id': user.id,
                'username': user.username
            }, status=status.HTTP_201_CREATED)
            
            response.set_cookie(
                settings.SESSION_COOKIE_NAME,
                request.session.session_key,
                httponly=True,
                secure=not settings.DEBUG,
                samesite='Lax'
            )
            return response
            
        logger.warning(f"Registration failed: {serializer.errors}")
        return Response({
            'status': 'error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class SessionCheckView(APIView, SecureResponseMixin):
    """Verify active user session"""
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication]

    def get(self, request):
        return Response({
            'isAuthenticated': True,
            'user_id': request.user.id,
            'username': request.user.username,
            'is_staff': request.user.is_staff
        }, status=status.HTTP_200_OK)

class UserProfileView(APIView, SecureResponseMixin):
    """Manage user profile information"""
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        serializer = UserProfileSerializer(
            request.user, 
            data=request.data, 
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            logger.info(f"User {request.user.id} updated profile")
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        logger.warning(f"Profile update failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordChangeView(APIView, SecureResponseMixin):
    """Handle password change requests"""
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication]

    def post(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            request.user.set_password(serializer.validated_data['new_password'])
            request.user.save()
            update_session_auth_hash(request, request.user)
            logger.info(f"User {request.user.id} changed password")
            return Response({
                'status': 'success',
                'message': 'Password changed successfully'
            }, status=status.HTTP_200_OK)
            
        logger.warning(f"Password change failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserViewSet(ModelViewSet, SecureResponseMixin):
    """User management endpoint (admin only)"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=user.id)