from celery import shared_task
from datetime import timedelta
from django.utils.timezone import now
from .models import File
import logging
import os

logger = logging.getLogger(__name__)

@shared_task
def delete_old_files():
    """
    Deletes files whose lifetime has exceeded 30 days
    """
    cutoff_date = now() - timedelta(days=30)
    old_files = File.objects.filter(uploaded_at__lt=cutoff_date)

    for file in old_files:
        try:
            if file.file and os.path.exists(file.file.path):
                file.file.delete(save=False)

            file.delete()

            logger.info(f"Deleted file: {file.name} (User ID: {file.user.id})")

        except Exception as e:
            logger.error(f"Error deleting file {file.name}: {e}")
