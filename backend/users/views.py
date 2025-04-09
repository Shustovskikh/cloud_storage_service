from django.contrib.auth import login, logout, update_session_auth_hash
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import SessionAuthentication
from .models import CustomUser
from .serializers import (
    UserSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    PasswordChangeSerializer
)
import logging

logger = logging.getLogger(__name__)

class UserLoginView(APIView):
    """
    Handle user login using email and password via session auth.
    """
    permission_classes = [AllowAny]
    authentication_classes = [SessionAuthentication]

    def post(self, request, *args, **kwargs):
        serializer = UserLoginSerializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)

            response_data = {
                'status': 'success',
                'user_id': user.id,
                'is_staff': user.is_staff
            }

            return self._prepare_response(response_data, status=status.HTTP_200_OK)

        return self._prepare_response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _prepare_response(self, data, status):
        response = Response(data, status=status)
        response['Cache-Control'] = 'no-store, no-cache, must-revalidate'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        return response


class UserLogoutView(APIView):
    """
    Handle session logout.
    """
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication]

    def post(self, request, *args, **kwargs):
        logout(request)
        return self._prepare_response({'status': 'success'}, status=status.HTTP_200_OK)

    def _prepare_response(self, data, status):
        response = Response(data, status=status)
        response['Cache-Control'] = 'no-store, no-cache, must-revalidate'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        return response


class RegisterUserView(APIView):
    """
    Register new user and login automatically.
    """
    permission_classes = [AllowAny]
    authentication_classes = [SessionAuthentication]

    def post(self, request, *args, **kwargs):
        serializer = UserSerializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            user = serializer.save()
            login(request, user)

            return self._prepare_response({
                'status': 'success',
                'user_id': user.id
            }, status=status.HTTP_201_CREATED)

        return self._prepare_response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _prepare_response(self, data, status):
        response = Response(data, status=status)
        response['Cache-Control'] = 'no-store, no-cache, must-revalidate'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        return response


class UserProfileView(APIView):
    """
    View and update authenticated user's profile.
    """
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return self._prepare_response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        serializer = UserProfileSerializer(
            request.user,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return self._prepare_response(serializer.data, status=status.HTTP_200_OK)

        return self._prepare_response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _prepare_response(self, data, status):
        response = Response(data, status=status)
        response['Cache-Control'] = 'no-store, no-cache, must-revalidate'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        return response


class PasswordChangeView(APIView):
    """
    Allow authenticated users to change their password.
    """
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication]

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            request.user.set_password(serializer.validated_data['new_password'])
            request.user.save()
            update_session_auth_hash(request, request.user)

            return self._prepare_response({'status': 'password changed successfully'}, status=status.HTTP_200_OK)

        return self._prepare_response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _prepare_response(self, data, status):
        response = Response(data, status=status)
        response['Cache-Control'] = 'no-store, no-cache, must-revalidate'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        return response


class UserViewSet(ModelViewSet):
    """
    Manage users: staff sees all, regular sees only self.
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return CustomUser.objects.all().order_by('-date_joined')
        return CustomUser.objects.filter(id=user.id)

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        self._add_security_headers(response)
        return response

    def _add_security_headers(self, response):
        response['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        response['X-Content-Type-Options'] = 'nosniff'
        return response

    def perform_destroy(self, instance):
        super().perform_destroy(instance)
        cache.clear()
