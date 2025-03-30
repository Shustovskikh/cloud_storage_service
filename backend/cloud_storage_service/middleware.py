import json
import logging
from django.utils.deprecation import MiddlewareMixin
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

logger = logging.getLogger(__name__)

class DisableCacheMiddleware(MiddlewareMixin):
    """
    Middleware to disable caching.
    """
    def process_response(self, request, response):
        response['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0, private'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'

        content_type = response.get('Content-Type', '')
        if 'application/json' in content_type:
            response['Cache-Control'] += ', proxy-revalidate'

        return response

class JWTSessionMiddleware(MiddlewareMixin):
    """
    Middleware for saving the JWT token in the user's session.
    If the response contains the 'access' field, the token is verified and saved in the session.
    """
    def process_response(self, request, response):
        content_type = response.get('Content-Type', '')
        if 'application/json' in content_type:
            try:
                response_content = response.content.decode('utf-8')
                data = json.loads(response_content)
            except (json.JSONDecodeError, UnicodeDecodeError) as e:
                logger.error("JSON parsing error in JWTSessionMiddleware: %s", e)
                return response

            if isinstance(data, list):
                logger.debug("The response is a list, the JWT token is not processed.")
                return response

            if isinstance(data, dict) and 'access' in data:
                access_token = data['access']
                try:
                    AccessToken(access_token)
                    if hasattr(request, 'session'):
                        request.session['jwt'] = access_token
                        logger.info("The JWT token is saved in the session.")
                    else:
                        logger.warning("The session is unavailable in the request.")
                except (InvalidToken, TokenError) as e:
                    logger.error("Invalid token: %s", e)
                except Exception as e:
                    logger.error("Error when processing the token: %s", e)
            else:
                logger.debug("The response does not contain a JWT token.")
        
        return response