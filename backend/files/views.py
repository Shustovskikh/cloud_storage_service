from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.decorators import action
from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.conf import settings
from urllib.parse import quote
from .models import File
from .serializers import FileSerializer
import logging
from rest_framework.authentication import SessionAuthentication
from .tasks import process_file

logger = logging.getLogger(__name__)

class FileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling file uploads, downloads and management.
    Provides CRUD operations with additional actions for file sharing.
    Integrates with Celery for asynchronous file processing.
    """
    queryset = File.objects.all()
    serializer_class = FileSerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        """
        Filters files based on user. Admin sees all files, others can see their own.
        """
        user = self.request.user
        if user.is_staff:
            return File.objects.all()
        return File.objects.filter(user=user)

    def perform_create(self, serializer):
        """
        Automatically assign the current user to new files.
        Triggers Celery task for asynchronous file processing after creation.
        """
        file_instance = serializer.save(user=self.request.user)
        # Trigger Celery task after file creation
        process_file.delay(file_instance.id)
        logger.info(f"Started processing for file ID {file_instance.id}")

    def perform_destroy(self, instance):
        """
        Delete a file from the database and storage.
        Handles both database record and physical file deletion.
        """
        try:
            instance.file.delete()
            instance.delete()
            logger.info(f"Deleted file ID {instance.id}")
        except Exception as e:
            logger.error(f"Error deleting file ID {instance.id}: {e}")
            raise Exception(f"Error deleting file: {e}")

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def get_shared_link(self, request, pk=None):
        """
        Generates and returns a unique link to view the file (not download).
        Creates absolute URL using current request's domain.
        """
        file = self.get_object()
        shared_url = request.build_absolute_uri(f'/files/{file.id}/view/')
        return Response({"shared_link": shared_url})

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """
        Downloads the file as an attachment.
        Updates last_downloaded timestamp on successful download.
        """
        file = get_object_or_404(File, pk=pk, user=request.user)
        try:
            file.last_downloaded = timezone.now()
            file.save()
            
            response = FileResponse(file.file.open('rb'), as_attachment=True)
            response['Content-Disposition'] = f'attachment; filename="{quote(file.name)}"'
            logger.info(f"Downloaded file ID {file.id}")
            return response
        except Exception as e:
            logger.error(f"File download error for ID {pk}: {str(e)}")
            raise Http404("File not found")

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def view(self, request, pk=None):
        """
        Displays the file inline in browser (for shared links).
        Does not require authentication for public access.
        """
        file = get_object_or_404(File, pk=pk)
        try:
            response = FileResponse(file.file.open('rb'))
            response['Content-Disposition'] = f'inline; filename="{quote(file.name)}"'
            return response
        except Exception as e:
            logger.error(f"File view error for ID {pk}: {str(e)}")
            raise Http404("File not found")

    @action(detail=True, 
            methods=['put'], 
            permission_classes=[IsAuthenticated],
            parser_classes=[MultiPartParser, FormParser])
    def update_file(self, request, pk=None):
        """
        Updates the file name and comment via form-data.
        Allows updates by file owner or admin.
        Triggers Celery task if file content is updated.
        """
        file_instance = self.get_object()
        
        if not (request.user.is_staff or request.user == file_instance.user):
            return Response(
                {'error': 'You can only update your own files.'},
                status=status.HTTP_403_FORBIDDEN
            )

        data = {
            'name': request.data.get('name'),
            'comment': request.data.get('comment')
        }
        
        data = {k: v for k, v in data.items() if v is not None}

        serializer = self.get_serializer(
            file_instance,
            data=data,
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            # Trigger Celery task if file content was updated
            if 'file' in request.FILES:
                process_file.delay(file_instance.id)
                logger.info(f"Triggered reprocessing for updated file ID {file_instance.id}")
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        logger.error(f"Update validation errors for file ID {pk}: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def finalize_response(self, request, response, *args, **kwargs):
        """
        Add no-cache headers to all responses in this viewset.
        Ensures fresh data and prevents browser caching of sensitive file information.
        """
        response = super().finalize_response(request, response, *args, **kwargs)
        response['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        return response