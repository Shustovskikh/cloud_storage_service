from rest_framework import serializers
from .models import File

class FileSerializer(serializers.ModelSerializer):
    """
    Serializer for File model that handles file uploads and metadata.
    Includes computed file_url field and handles file ownership.
    """
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = ['id', 'user', 'name', 'file', 'size', 'uploaded_at', 
                'shared_link', 'file_url', 'comment', 'last_downloaded']
        read_only_fields = ['id', 'user', 'size', 'uploaded_at', 
                          'shared_link', 'file_url', 'last_downloaded']

    def create(self, validated_data):
        """
        Creates a file and automatically binds it to the current user.
        Sets default comment if none provided.
        """
        validated_data['user'] = self.context['request'].user
        validated_data['comment'] = validated_data.get('comment', "No comment")
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """
        Allows users to update only the name and comment of their files.
        Preserves existing values if new ones aren't provided.
        """
        instance.name = validated_data.get('name', instance.name)
        instance.comment = validated_data.get('comment', instance.comment or "No comment")
        instance.save()
        return instance

    def get_file_url(self, obj):
        """
        Returns the full URL to the file using the current request's domain.
        Used for providing download links in API responses.
        """
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.file.url)
        return None