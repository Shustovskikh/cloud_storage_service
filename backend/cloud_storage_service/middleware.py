import logging
from django.utils.deprecation import MiddlewareMixin

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
