from django.shortcuts import render
from django.http import JsonResponse
from django.http import HttpResponse
from rest_framework.exceptions import AuthenticationFailed
from .serializer import UserSerializer
from django.contrib.auth import authenticate
from .models import User, ValidToken
from django.utils.timezone import now
from datetime import timedelta
from .views import refresh_token
import jwt
import os
from ipware import get_client_ip
from django.utils.deprecation import MiddlewareMixin

class ExposeAuthorizationHeaderMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        if 'Authorization' in response:
            response['Access-Control-Expose-Headers'] = 'Authorization'
        return response

class SimpleMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        
        if request.path.startswith(('/media/', '/static/', '/api/auth/', '/api/user/code', '/api/user/token')):
            return self.get_response(request)
        
        new_token = None
        
        if not request.path == '/api/user/login' and not request.path == '/api/user/create' and not request.path == '/api/user/set_token' and not request.path == '/api/user/get_token':
            auth_header = request.headers.get('Authorization')
            
            if not auth_header:
                raise AuthenticationFailed('Authorization header missing!')
            try:
                token = auth_header.split(' ')[1]
                if not token:
                    raise AuthenticationFailed('Token is invalid!')
                
                if not ValidToken.objects.filter(token=token).exists():
                    raise AuthenticationFailed('Invalid or expired token!')
                
                payload = jwt.decode(token, os.getenv('JWT_KEY'), algorithms=['HS256'])
                user = User.objects.filter(id=payload['id']).first()
                if user is not None:
                    request.user = user
                if not request.path.startswith('/api/user/') and request.POST:
                    new_token = refresh_token(user, token)
                    
            except jwt.ExpiredSignatureError:
                user.status = "offline"
                user.save()
                raise AuthenticationFailed('Token expired!')
            except jwt.InvalidTokenError:
                raise AuthenticationFailed('Invalid token!')
            
        response = self.get_response(request)
        
        if new_token:
            response.set_cookie(key='token', value=new_token, max_age=3600, httponly=True, secure=True)
            response.data = {
                'token': new_token
            }
            
        return response