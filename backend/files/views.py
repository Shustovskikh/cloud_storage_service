from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.decorators import action
from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from .models import File
from .serializers import FileSerializer

class FileViewSet(viewsets.ModelViewSet):
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

    def perform_destroy(self, instance):
        """
        Delete a file from the database and storage.
        """
        try:
            instance.file.delete()
            instance.delete()
        except Exception as e:
            raise Exception(f"Error deleting file: {e}")

    def list(self, request, *args, **kwargs):
        """
        Override list to ensure fresh data is sent on each request.
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        response = Response(serializer.data)
        return self.add_no_cache_headers(response)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def get_shared_link(self, request, pk=None):
        """
        Generates and returns a unique link to download the file.
        """
        file = self.get_object()
        shared_url = request.build_absolute_uri(file.get_shared_url())
        response = Response({"shared_link": shared_url})
        return self.add_no_cache_headers(response)

    @action(detail=False, methods=['get'], url_path='download/(?P<shared_link>[^/]+)', permission_classes=[AllowAny])
    def download_file(self, request, shared_link=None):
        """
        Processes requests to download files using a unique link.
        """
        file_instance = get_object_or_404(File, shared_link=shared_link)
        try:
            response = FileResponse(file_instance.file.open(), as_attachment=True, filename=file_instance.file.name.split('/')[-1])
            return self.add_no_cache_headers(response)
        except Exception:
            raise Http404("File not found")

    def finalize_response(self, request, response, *args, **kwargs):
        """
        Add no-cache headers to all responses in this viewset.
        """
        response['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        return super().finalize_response(request, response, *args, **kwargs)

    def add_no_cache_headers(self, response):
        """
        Utility method to add no-cache headers to a response.
        """
        response['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        return response

    @action(detail=True, methods=['put'], permission_classes=[IsAuthenticated], parser_classes=[MultiPartParser, FormParser])
    def update_file(self, request, pk=None):
        """
        Updates the file name.
        """
        file = self.get_object()
        serializer = FileSerializer(file, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
