import json
import jwt
from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings
import logging

# Configuring the logger
logger = logging.getLogger(__name__)

class FileConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """
        Handles the WebSocket connection when the client connects.
        """
        query_string = self.scope.get("query_string", b"").decode()
        token = None

        # Extracted the token from the query string
        if "token=" in query_string:
            token = query_string.split("token=")[1].split("&")[0]

        if not token:
            logger.error("Token not provided in query string")
            await self.close(code=4001)
            return

        logger.debug(f"Token received: {token}")

        try:
            decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            logger.debug(f"Decoded token: {decoded_token}")

            # Saving user information (optional)
            self.user_id = decoded_token.get("user_id")

            if not self.user_id:
                logger.error("Token is valid but user_id is missing")
                await self.close(code=4003)
                return

            await self.accept()
            logger.info(f"WebSocket connection accepted for user_id: {self.user_id}")

        except jwt.ExpiredSignatureError:
            logger.warning("Token has expired")
            await self.close(code=4004)
        except jwt.InvalidTokenError as e:
            logger.error(f"Invalid token: {e}")
            await self.close(code=4005)
        except Exception as e:
            logger.critical(f"Unexpected error during connection: {e}")
            await self.close(code=4006)

    async def disconnect(self, close_code):
        """
        Handles WebSocket disconnection.
        """
        logger.info(f"WebSocket disconnected for user_id: {getattr(self, 'user_id', 'Unknown')} with close code: {close_code}")

    async def receive(self, text_data):
        """
        Handles incoming WebSocket messages.
        """
        logger.debug(f"Received data: {text_data}")

        try:
            data = json.loads(text_data)
            logger.info(f"Parsed data: {data}")

            response = {
                'message': 'Data received successfully',
                'received_data': data,
            }

            await self.send(text_data=json.dumps(response))
            logger.debug(f"Sent response: {response}")
        
        except json.JSONDecodeError as e:
            logger.warning(f"JSON decode error: {e}")
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON format'
            }))
        
        except Exception as e:
            logger.error(f"Unexpected error during receive: {e}")
            await self.send(text_data=json.dumps({
                'error': 'An unexpected error occurred'
            }))
