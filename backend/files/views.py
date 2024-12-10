from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
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
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return self.queryset
        return self.queryset.filter(user=user)

    def perform_destroy(self, instance):
        try:
            instance.file.delete()
            instance.delete()
        except Exception as e:
            raise Exception(f"Error deleting file: {e}")

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def get_shared_link(self, request, pk=None):
        """
        Generates and returns a unique link to download the file
        """
        file = self.get_object()
        shared_url = request.build_absolute_uri(file.get_shared_url())
        return Response({"shared_link": shared_url})

    @action(detail=False, methods=['get'], url_path='download/(?P<shared_link>[^/]+)', permission_classes=[AllowAny])
    def download_file(self, request, shared_link=None):
        """
        Processes requests to download files using a unique link
        """
        file_instance = get_object_or_404(File, shared_link=shared_link)
        try:
            return FileResponse(file_instance.file.open(), as_attachment=True, filename=file_instance.file.name.split('/')[-1])
        except Exception:
            raise Http404("File not found")
