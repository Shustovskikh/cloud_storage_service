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
    Rejects unauthenticated connections and provides secure file update notifications.
    """

    async def connect(self):
        """
        Handles new WebSocket connection.
        Performs strict authentication check before accepting connection.
        Adds authenticated users to the file updates notification group.
        
        Rejects connection with code 4001 if:
        - User is not authenticated
        - Session cookie is invalid/missing
        """
        self.room_group_name = 'file_updates'
        self.user = self.scope["user"]

        # Strict authentication check
        if not self.user.is_authenticated or isinstance(self.user, AnonymousUser):
            logger.warning(f"Rejected unauthorized connection attempt from {self.scope['client'][0]}")
            await self.close(code=4001)
            return

        # Add to notification group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        logger.info(f"Accepted WebSocket connection for user: {self.user.username}")

    async def disconnect(self, close_code):
        """
        Handles WebSocket disconnection.
        Removes user from notification group and logs the event.
        
        Args:
            close_code (int): WebSocket close code
        """
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
        logger.info(f"WebSocket disconnected for {self.user.username} with code: {close_code}")

    async def receive(self, text_data):
        """
        Processes incoming WebSocket messages.
        Validates JSON format and handles ping/pong heartbeat mechanism.
        
        Args:
            text_data (str): JSON-encoded message data
        """
        try:
            data = json.loads(text_data)
            logger.debug(f"Received message from {self.user.username}: {data}")

            if data.get('action') == 'ping':
                await self.send(json.dumps({
                    'action': 'pong',
                    'user': self.user.username,
                    'status': 'authenticated'
                }))

        except json.JSONDecodeError:
            logger.warning(f"Invalid JSON received from {self.user.username}")
            await self.send(json.dumps({
                'error': 'Invalid JSON format',
                'status': 'error'
            }))

    async def file_notification(self, event):
        """
        Broadcasts file updates to all connected clients.
        Ensures proper formatting and error handling for notifications.
        
        Args:
            event (dict): Contains:
                - file_id (int): Updated file ID
                - action (str): 'created', 'updated' or 'deleted'
                - file_data (dict): File information (optional)
                - user (str): Username who triggered the update (added)
        """
        try:
            await self.send(text_data=json.dumps({
                'type': 'file_update',
                'file_id': event['file_id'],
                'action': event['action'],
                'data': event.get('file_data', {}),
                'user': event.get('user', 'system'),
                'timestamp': event.get('timestamp', '')
            }))
        except Exception as e:
            logger.error(f"Failed to send update to {self.user.username}: {str(e)}")
            await self.send(json.dumps({
                'error': 'Internal server error',
                'status': 'error'
            }))