from django.contrib.auth import get_user_model
from functools import wraps
from rest_framework.exceptions import AuthenticationFailed
import jwt
import os

def jwt_auth_required(view_func):
    @wraps(view_func)
    def wrapped_view(request, *args, **kwargs):
        try:
            token = request.COOKIES.get('token')
            payload = jwt.decode(token, os.getenv('JWT_KEY'), algorithms=['HS256'])
            user = get_user_model().objects.get(id=payload['id'])
            request.user = user
        except jwt.ExpiredSignatureError:
            user.status = 'offline'
            user.save()
            return Response({'error': 'TokenExpired'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            user.status = 'offline'
            user.save()
            return Response({'error': 'TokenExpired'}, status=status.HTTP_401_UNAUTHORIZED)
        except get_user_model().DoesNotExist:
            return Response({'error': 'TokenExpired'}, status=status.HTTP_401_UNAUTHORIZED)

        return view_func(request, *args, **kwargs)
    
    return wrapped_view
