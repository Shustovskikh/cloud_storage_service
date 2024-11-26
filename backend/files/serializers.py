from rest_framework import serializers
from .models import File

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['id', 'user', 'name', 'file', 'uploaded_at', 'shared_link']
        read_only_fields = ['id', 'uploaded_at', 'shared_link']
