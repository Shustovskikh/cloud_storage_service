from django.db import models
from django.conf import settings
import uuid
import os
from django.db.models.signals import post_delete, pre_delete
from django.dispatch import receiver
from datetime import timedelta
from django.utils.timezone import now

def user_directory_path(instance, filename):
    """
    Generates a file upload path that includes the user name.
    Example: uploads/<username>/<filename>
    """
    return f"uploads/{instance.user.username}/{filename}"

def default_auto_deleted_at():
    """
    Returns the date and time for automatic file deletion.
    For example, after 30 days
    """
    return now() + timedelta(days=30)

class File(models.Model):
    """
    Model representing uploaded files with metadata.
    Includes tracking for last download time.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="files"
    )
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to=user_directory_path)
    size = models.PositiveIntegerField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    auto_deleted_at = models.DateTimeField(default=default_auto_deleted_at)
    shared_link = models.CharField(max_length=36, blank=True, null=True, unique=True)
    comment = models.TextField(null=True, blank=True)
    last_downloaded = models.DateTimeField(
        null=True, 
        blank=True, 
        verbose_name="Last Downloaded",
        help_text="Date and time when the file was last downloaded"
    )

    def save(self, *args, **kwargs):
        """
        Redefining the save method to set the file size and unique shared_link.
        Automatically calculates size if not set and generates shared_link if missing.
        """
        if self.file and not self.size:
            try:
                self.size = self.file.size
            except AttributeError:
                self.size = 0
        if not self.shared_link:
            self.shared_link = str(uuid.uuid4())
        super().save(*args, **kwargs)

    def get_shared_url(self):
        """
        Generates a relative URL for downloading a file by `shared_link`.
        Used for creating shareable download links.
        """
        from django.urls import reverse
        return reverse('file-download', kwargs={'shared_link': self.shared_link})

    def __str__(self):
        """String representation of the file for admin interface and debugging."""
        return f"{self.name} ({self.user.username})"

@receiver(post_delete, sender=File)
def delete_file_on_model_delete(sender, instance, **kwargs):
    """
    Signal receiver to delete physical file from storage when model instance is deleted.
    Prevents orphaned files in storage when database records are removed.
    """
    if instance.file and os.path.isfile(instance.file.path):
        os.remove(instance.file.path)

@receiver(pre_delete, sender=settings.AUTH_USER_MODEL)
def delete_user_directory(sender, instance, **kwargs):
    """
    Signal receiver to delete user's upload directory when user is deleted.
    Recursively removes all files and subdirectories in the user's upload folder.
    """
    user_folder = os.path.join(settings.MEDIA_ROOT, "uploads", instance.username)
    if os.path.isdir(user_folder):
        for root, dirs, files in os.walk(user_folder, topdown=False):
            for file in files:
                os.remove(os.path.join(root, file))
            for dir in dirs:
                os.rmdir(os.path.join(root, dir))
        os.rmdir(user_folder)