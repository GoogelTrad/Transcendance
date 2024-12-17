from django.contrib.auth import get_user_model
from functools import wraps
from rest_framework.exceptions import AuthenticationFailed
import jwt

def jwt_auth_required(view_func):
    @wraps(view_func)
    def wrapped_view(request, *args, **kwargs):
        # Récupère le header d'authentification contenant le token JWT
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            raise AuthenticationFailed('Authorization header missing!')

        try:
            # Extrait le token du header
            token = auth_header.split(' ')[1]
            # Décode le token et vérifie la validité
            payload = jwt.decode(token, 'coucou', algorithms=['HS256'])
            # Recherche l'utilisateur correspondant à l'ID dans le payload
            user = get_user_model().objects.get(id=payload['id'])
            # Assigne l'utilisateur au request.user
            request.user = user
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expired!')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token!')
        except get_user_model().DoesNotExist:
            raise AuthenticationFailed('User not found!')

        # Appelle la fonction de vue originale avec les arguments appropriés
        return view_func(request, *args, **kwargs)
    
    return wrapped_view
