from rest_framework import serializers
from .models import File

class FileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = ['id', 'user', 'name', 'file', 'size', 'uploaded_at', 'shared_link', 'file_url']
        read_only_fields = ['id', 'user', 'size', 'uploaded_at', 'shared_link', 'file_url']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def get_file_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.file.url)
        return None
