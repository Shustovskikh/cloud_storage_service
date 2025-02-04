from django.urls import re_path
from . import consumers
import logging

logger = logging.getLogger(__name__)

websocket_urlpatterns = [
    re_path(r'^ws/files/$', consumers.FileConsumer.as_asgi()),
]

logger.debug("WebSocket URL patterns configured")
