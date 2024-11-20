from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.exceptions import AuthenticationFailed
from .serializer import UserSerializer
from .models import User
import jwt


class SimpleMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        # One-time configuration and initialization.

    def __call__(self, request):
        # Code to be executed for each request before
        # the view (and later middleware) are called.
        if not request.path == '/api/login' and request.path == '/api/user/create':
            # request.user = None

            auth_header = request.headers.get('Authorization')
            
            if not auth_header:
                raise AuthenticationFailed('Authorization header missing!')
            
            try:
                token = auth_header.split(' ')[1]
                payload = jwt.decode(token, 'coucou', algorithms=['HS256'])
                request.user = payload
                # return (HttpResponse(request.user))
            except jwt.ExpiredSignatureError:
                raise AuthenticationFailed('Token expired!')
            except jwt.InvalidTokenError:
                raise AuthenticationFailed('Invalid token!')
            except ImportError:
                AuthenticationFailed('Invalid Authorization header format!')
        response = self.get_response(request)

        # Code to be executed for each request/response after
        # the view is called.

        return response
