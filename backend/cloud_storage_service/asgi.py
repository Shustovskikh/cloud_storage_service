"""
ASGI config for cloud_storage_service project.

It exposes the ASGI callable as a module-level variable named `application`.
Handles both HTTP and WebSocket protocols with session authentication.
"""

import os
import django
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import re_path
import logging

# Initialize Django ASGI application early to ensure AppRegistry is loaded
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cloud_storage_service.settings')
django.setup()

# Get logger instance
logger = logging.getLogger(__name__)

# Import consumers only AFTER Django setup
from files import consumers  # noqa: E402

# WebSocket URL patterns
websocket_urlpatterns = [
    re_path(r'ws/files/$', consumers.FileConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})

logger.info("ASGI application successfully configured")