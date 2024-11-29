from django.shortcuts import render
from django.http import JsonResponse
from django.http import HttpResponse
from rest_framework.exceptions import AuthenticationFailed
from .serializer import UserSerializer
from .models import User
import jwt


class SimpleMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        
        if request.path.startswith('/media/') or request.path.startswith('/static/'):
            return self.get_response(request)
        
        if not request.path == '/api/login' and not request.path == '/api/user/create':
            auth_header = request.headers.get('Authorization')
            
            if not auth_header:
                raise AuthenticationFailed('Authorization header missing!')
            try:
                token = auth_header.split(' ')[1]
                if not token:
                    raise AuthenticationFailed('Token is invalid!')
                payload = jwt.decode(token, 'coucou', algorithms=['HS256'])
                request.user = payload
            except jwt.ExpiredSignatureError:
                raise AuthenticationFailed('Token expired!')
            except jwt.InvalidTokenError:
                raise AuthenticationFailed('Invalid token!')
        response = self.get_response(request)

        return response
