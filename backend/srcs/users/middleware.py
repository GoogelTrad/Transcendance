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
from rest_framework import status
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
        
        if request.path.startswith(('/media/', '/static/', '/api/auth/', '/api/user/code', '/api/user/delete')):
            return self.get_response(request)
        
        new_token = None
        ValidToken().clean_expired_tokens()
                
        if not request.path == '/api/user/login' and not request.path == '/api/user/create' and not request.path == '/api/user/help_me':
            try:
                token = request.COOKIES.get('token')

                if not token:
                    return JsonResponse({'error': 'TokenExpired'}, status=status.HTTP_401_UNAUTHORIZED)
                
                if not ValidToken.objects.filter(token=token).exists():
                    return JsonResponse({'error': 'TokenExpired'}, status=status.HTTP_401_UNAUTHORIZED)
                
                payload = jwt.decode(token, os.getenv('JWT_KEY'), algorithms=['HS256'])
                user = User.objects.filter(id=payload['id']).first()
                if user is not None:
                    request.user = user
                if not request.path.startswith('/api/user/') and (request.method == 'POST' or request.method == 'PATCH'):
                    new_token = refresh_token(user, token)
                    
            except jwt.ExpiredSignatureError:
                user.status = "offline"
                user.save()
                return JsonResponse({'error': 'TokenExpired'}, status=status.HTTP_401_UNAUTHORIZED)
            except jwt.InvalidTokenError:
                return JsonResponse({'error': 'TokenExpired'}, status=status.HTTP_401_UNAUTHORIZED)
            
        response = self.get_response(request)
        
        if new_token:
            response.set_cookie(key='token', value=new_token, max_age=int(os.getenv('TOKEN_TIME')), httponly=True, secure=True, samesite='None')
            
        return response