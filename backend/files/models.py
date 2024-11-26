from django.db import models 
from django.conf import settings

class File(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="files"
    )
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='uploads/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    shared_link = models.CharField(max_length=255, blank=True, null=True, unique=True)

    def __str__(self):
        return self.name
