import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser

logger = logging.getLogger(__name__)

class FileConsumer(AsyncWebsocketConsumer):
    """
    Handles real-time file updates through WebSocket connections.
    Uses Django's session authentication via cookies.
    """

    async def connect(self):
        """
        Handles new WebSocket connection.
        Rejects unauthenticated users and adds authenticated users to update group.
        """
        self.room_group_name = 'file_updates'
        self.user = self.scope["user"]

        if isinstance(self.user, AnonymousUser):
            logger.warning("Rejected unauthenticated WebSocket connection")
            await self.close(code=4001)
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        logger.info(f"Accepted WebSocket connection for user: {self.user.username}")

    async def disconnect(self, close_code):
        """
        Handles WebSocket disconnection.
        
        Args:
            close_code (int): WebSocket close code
        """
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
        logger.info(f"WebSocket disconnected with code: {close_code}")

    async def receive(self, text_data):
        """
        Processes incoming WebSocket messages.
        
        Args:
            text_data (str): JSON-encoded message data
        """
        try:
            data = json.loads(text_data)
            logger.debug(f"Received WebSocket message: {data}")

            if data.get('action') == 'ping':
                await self.send(json.dumps({
                    'action': 'pong',
                    'user': self.user.username
                }))

        except json.JSONDecodeError:
            logger.warning("Received invalid JSON via WebSocket")
            await self.send(json.dumps({
                'error': 'Invalid JSON format'
            }))

    async def file_notification(self, event):
        """
        Broadcasts file updates to all connected clients.
        
        Args:
            event (dict): Contains:
                - file_id (int): Updated file ID
                - action (str): 'created', 'updated' or 'deleted'
                - file_data (dict): File information (optional)
        """
        try:
            await self.send(text_data=json.dumps({
                'type': 'file_update',
                'file_id': event['file_id'],
                'action': event['action'],
                'data': event.get('file_data', {})
            }))
        except Exception as e:
            logger.error(f"Failed to send file update: {str(e)}")