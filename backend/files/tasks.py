from celery import shared_task
from datetime import timedelta
from django.utils.timezone import now
from .models import File
import logging

logger = logging.getLogger(__name__)

@shared_task
def delete_old_files():
    """
    Deletes files whose lifetime has exceeded 30 days.
    Runs automatically via Celery beat schedule.
    """
    try:
        cutoff_date = now() - timedelta(days=30)
        deleted_count, _ = File.objects.filter(uploaded_at__lt=cutoff_date).delete()
        logger.info(f"Successfully deleted {deleted_count} old files")
        return deleted_count
    except Exception as e:
        logger.error(f"Error deleting old files: {str(e)}")
        raise

@shared_task
def process_file(file_id):
    """
    Minimal file processing task.
    Currently just logs the file receipt.
    Can be extended with actual processing logic later.
    """
    try:
        logger.info(f"File {file_id} received for processing")
        return {
            "status": "success",
            "file_id": file_id,
            "message": "File processing completed (mock)"
        }
    except Exception as e:
        logger.error(f"Error processing file {file_id}: {str(e)}")
        raise