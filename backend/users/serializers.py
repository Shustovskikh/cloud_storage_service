from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password', 'is_staff', 'is_superuser']

    def create(self, validated_data):
        """
        Creating a new user with password hashing
        """
        user = CustomUser.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        """
        Updating the user with hashing a new password
        """
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class TokenUserSerializer(serializers.ModelSerializer):
    """
    Serializer for including user details in token response
    """
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'is_staff', 'email']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom serializer to include `is_staff` field in the token response
    """
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data['is_staff'] = user.is_staff
        return data
