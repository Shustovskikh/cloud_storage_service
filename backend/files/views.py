from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.decorators import action
from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import File
from .serializers import FileSerializer
import logging

logger = logging.getLogger(__name__)

class FileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling file uploads, downloads and management.
    Provides CRUD operations with additional actions for file sharing.
    """
    queryset = File.objects.all()
    serializer_class = FileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        """
        Filters files based on user. Admin sees all files, others can see their own.
        """
        user = self.request.user
        if user.is_staff:
            return File.objects.all()
        return File.objects.filter(user=user)

    def perform_create(self, serializer):
        """Automatically assign the current user to new files"""
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        """
        Delete a file from the database and storage.
        Handles both database record and physical file deletion.
        """
        try:
            instance.file.delete()
            instance.delete()
        except Exception as e:
            raise Exception(f"Error deleting file: {e}")

    def list(self, request, *args, **kwargs):
        """
        Override list to ensure fresh data is sent on each request.
        Adds no-cache headers to prevent browser caching of file lists.
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        response = Response(serializer.data)
        return self.add_no_cache_headers(response)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def get_shared_link(self, request, pk=None):
        """
        Generates and returns a unique link to download the file.
        Creates absolute URL using current request's domain.
        """
        file = self.get_object()
        shared_url = request.build_absolute_uri(file.get_shared_url())
        response = Response({"shared_link": shared_url})
        return self.add_no_cache_headers(response)

    @action(detail=False, methods=['get'], url_path='download/(?P<shared_link>[^/]+)', permission_classes=[AllowAny])
    def download_file(self, request, shared_link=None):
        """
        Processes requests to download files using a unique link.
        Updates last_downloaded timestamp on successful download.
        Returns the file as attachment with proper caching headers.
        """
        file_instance = get_object_or_404(File, shared_link=shared_link)
        try:
            # Update last download timestamp before serving the file
            file_instance.last_downloaded = timezone.now()
            file_instance.save()
            
            response = FileResponse(file_instance.file.open(), 
                                  as_attachment=True, 
                                  filename=file_instance.file.name.split('/')[-1])
            return self.add_no_cache_headers(response)
        except Exception as e:
            logger.error(f"File download error: {str(e)}")
            raise Http404("File not found")

    @action(detail=True, 
            methods=['put'], 
            permission_classes=[IsAuthenticated],
            parser_classes=[MultiPartParser, FormParser],
            url_path='update')
    def update_file(self, request, pk=None):
        """
        Updates the file name and comment via form-data.
        Allows updates by file owner or admin.
        """
        file_instance = self.get_object()
        
        # Allow admin or file owner to update
        if not (request.user.is_staff or request.user == file_instance.user):
            return Response(
                {'error': 'You can only update your own files.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Process form-data
        data = {
            'name': request.data.get('name'),
            'comment': request.data.get('comment')
        }
        
        # Remove None values to keep existing data
        data = {k: v for k, v in data.items() if v is not None}

        serializer = self.get_serializer(
            file_instance,
            data=data,
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        logger.error(f"Update validation errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def finalize_response(self, request, response, *args, **kwargs):
        """
        Add no-cache headers to all responses in this viewset.
        Ensures browsers don't cache sensitive file data.
        """
        response = super().finalize_response(request, response, *args, **kwargs)
        return self.add_no_cache_headers(response)

    def add_no_cache_headers(self, response):
        """
        Utility method to add no-cache headers to a response.
        """
        response['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        return response