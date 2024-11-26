from rest_framework.viewsets import ModelViewSet
from .models import File
from .serializers import FileSerializer

class FileViewSet(ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer
