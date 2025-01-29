from django.shortcuts import render
from django.http import JsonResponse
from django.http import HttpResponse
from rest_framework.exceptions import AuthenticationFailed
from .serializer import UserSerializer
from django.contrib.auth import authenticate
from .models import User, ValidToken
from django.utils.timezone import now
from datetime import timedelta
import jwt


class SimpleMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        
        if request.path.startswith('/media/') or request.path.startswith('/static/') or request.path.startswith('/auth/') or request.path.startswith('/api/code'):
            return self.get_response(request)
        
        if not request.path == '/api/login' and not request.path == '/api/user/create':
            auth_header = request.headers.get('Authorization')
            
            if not auth_header:
                raise AuthenticationFailed('Authorization header missing!')
            try:
                token = auth_header.split(' ')[1]
                if not token:
                    raise AuthenticationFailed('Token is invalid!')
                
                if not ValidToken.objects.filter(token=token).exists():
                    raise AuthenticationFailed('Invalid or expired token!')
                
                payload = jwt.decode(token, 'coucou', algorithms=['HS256'])
                user = authenticate(request, user_id=payload['id'])
                if user is not None:
                    request.user = user
            except jwt.ExpiredSignatureError:
                user.status = "offline"
                user.save()
                raise AuthenticationFailed('Token expired!')
            except jwt.InvalidTokenError:
                raise AuthenticationFailed('Invalid token!')
            
        response = self.get_response(request)

        return response