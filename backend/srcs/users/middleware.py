from django.shortcuts import render
from rest_framework.exceptions import AuthenticationFailed
from .serializer import UserSerializer
from .models import User
import jwt


def simple_middleware(get_response):
    # One-time configuration and initialization.

    def middleware(request):

        if not request.path == '/api/login':
            auth_header = request.headers.get('Authorization')
            
            if not auth_header:
                raise AuthenticationFailed('Authorization header missing!')
            
            try:
                token = auth_header.split(' ')[1]
                payload = jwt.decode(token, 'coucou', algorithms=['HS256'])
                request.user = payload
            except jwt.ExpiredSignatureError:
                raise AuthenticationFailed('Token expired!')
            except jwt.InvalidTokenError:
                raise AuthenticationFailed('Invalid token!')
            except ImportError:
                AuthenticationFailed('Invalid Authorization header format!')

        response = get_response(request)

        return response

    return middleware