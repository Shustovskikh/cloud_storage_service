"""
ASGI config for cloud_storage_service project.

This file configures the ASGI application to handle HTTP and WebSocket protocols.

For more information on this file, see:
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path
from files import consumers
import logging

logger = logging.getLogger(__name__)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cloud_storage_service.settings')

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,

    "websocket": AuthMiddlewareStack(
        URLRouter([
            path('ws/files/', consumers.FileConsumer.as_asgi()),
        ])
    ),
})

logger.debug("ASGI application configured")
