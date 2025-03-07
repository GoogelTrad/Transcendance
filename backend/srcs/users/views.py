from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.decorators import api_view, action
from .serializer import UserSerializer
from django.http import HttpResponse
from django.contrib.auth import authenticate, login
from .models import User, ValidToken, ConfirmationCode
from users.decorator import jwt_auth_required
from django.core.mail import send_mail
from ipware import get_client_ip
from django.conf import settings
from django.utils.timezone import now
import random
import jwt
import os


class LoginView():
    @api_view(['POST'])
    def loginUser(request):
        name = request.data['name']
        password = request.data['password']

        user = User.objects.filter(name=name).first()

        if user is None:
            raise AuthenticationFailed('User not found!')
        
        if not user.check_password(password):
            raise AuthenticationFailed('Incorrect password!')
        
    
        ip, routable = get_client_ip(request)
        
        if user.ip_user is not ip and not user.enable_verified:
            user.last_verified = None
            user.save()
            
        if user.enable_verified is True:
            if not user.last_verified or (now() - user.last_verified).days >= 3:
                user.ip_user = ip
                user.is_verified = False
                user.save()
                send_confirmation_email(user)
                return Response(
                    {'message': 'Verification required. Check your email for the confirmation code.'},
                    status=status.HTTP_302_FOUND
                )
        user.ip_user = ip
        user.status = 'online'
        user.save()
        
        profile_image_url = user.profile_image.url if user.profile_image else None
        
        payload = { 
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'status': user.status,
            'profile_image_url': profile_image_url,
            'is_stud': user.is_stud,
        }

        token = jwt.encode(payload, os.getenv('JWT_KEY'), 'HS256')
        if ValidToken.objects.filter(user=user).exists():
            ValidToken.objects.filter(user=user).delete()
        ValidToken.objects.create(user=user, token=token)

        reponse = Response()

        reponse.set_cookie(key='token', value=token, max_age=int(os.getenv('TOKEN_TIME', '3600')), httponly=True, secure=True, samesite='None')
        reponse.data = {
            'message': 'Logged in successfully!'
        }
        return reponse

class UserView():
    @api_view(['GET', 'PATCH', 'DELETE'])
    def userDetails(request, pk):

        if not request.user.is_authenticated:
            try:
                user = User.objects.get(pk=pk)
            except:
                raise AuthenticationFailed('User not found!')
            

            if request.method == 'GET':
                serializer = UserSerializer(user)
                user_data = serializer.data
                if user_data == request.user:
                    filtered_user = {key: value for key, value in user_data.items() if key not in ['password']}
                else:
                    filtered_user = {key: value for key, value in user_data.items() if key not in ['password']}
                return Response(filtered_user)
            
            elif request.method == 'PATCH':
                serializer = UserSerializer(user, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    profile_image_url = user.profile_image.url if user.profile_image else None
                    payload = {
                        'id': user.id,
                        'name': user.name,
                        'email': user.email,
                        'status': user.status,
                        'profile_image_url': profile_image_url,
                        'is_stud': user.is_stud,
                    }
                    reponse = Response()
                    new_token = jwt.encode(payload, os.getenv('JWT_KEY'), 'HS256')
                    
                    print(f'newtoken = {new_token}', flush=True)
                    
                    ValidToken.objects.filter(user_id=user.id).delete()
                    ValidToken.objects.create(user=user, token=new_token)
                    
                    filtered_user = {key: value for key, value in serializer.data.items() if key not in ['password']}
                    reponse.delete_cookie('token')
                    reponse.set_cookie(key='token', value=new_token, max_age=int(os.getenv('TOKEN_TIME', '3600')), httponly=True, secure=True, samesite='None')
                    reponse.data = {
                        **filtered_user
                    }
                    
                    return reponse
                return Response("ErrorUploadingProfileImage", status=status.HTTP_400_BAD_REQUEST)
        
            elif request.method == 'DELETE':
                user.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)

    @api_view(['POST'])
    def createUser(request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)   
        serializer.save()

        return Response(serializer.data)

    @api_view(['GET'])
    def count_users(request):
        try :
            user_count = User.objects.count()
            return Response({'count': user_count})
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class LogoutView():
    @api_view(['GET'])
    @jwt_auth_required
    def logoutUser(request):
        
        token = request.COOKIES.get('token')
        if not token :
            AuthenticationFailed('Token is missing!')
        
        user = User.objects.get(name=request.user.name)
        user.status = 'offline'
        user.save()
        
        ValidToken.objects.filter(token=token).delete()
        
        reponse = Response()
        reponse.delete_cookie('token')
        reponse.data = {
            'message': 'success'
        }
        return reponse


def generate_confirmation_code():
	return f"{random.randint(100000, 999999)}"

def send_confirmation_email(user):
    code = generate_confirmation_code()

    ConfirmationCode.objects.update_or_create(user=user, defaults={"code": code})

    subject = "Votre code de confirmation Transcendance!"
    message = f"Votre code de confirmation est : {code}"
    from_email = settings.EMAIL_HOST_USER
    recipient_list = [user.email]
    send_mail(subject, message, from_email, recipient_list)

@api_view(['POST'])
def verify_code(request):
    name = request.data.get('name')
    code = request.data.get('code')

    if not name or not code:
        return Response({'message': 'Username and code are required!'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(name=name)
    except User.DoesNotExist:
        return Response({'message': 'User not found!'}, status=status.HTTP_404_NOT_FOUND)

    confirmation = ConfirmationCode.objects.filter(user=user).first()

    if confirmation and confirmation.code == code:
        user.is_verified = True
        user.status = 'online'
        user.last_verified = now()
        user.save()
        
        profile_image_url = user.profile_image.url if user.profile_image else None
        
        payload = { 
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'status': user.status,
            'profile_image_url': profile_image_url,
            'is_stud': user.is_stud,
        }

        token = jwt.encode(payload, os.getenv('JWT_KEY'), 'HS256')
        if ValidToken.objects.filter(user=user).exists():
            ValidToken.objects.filter(user=user).delete()
        ValidToken.objects.create(user=user, token=token)

        reponse = Response()

        reponse.set_cookie(key='token', value=token, max_age=int(os.getenv('TOKEN_TIME', '3600')), httponly=True, secure=True, samesite='None')
        reponse.data = {
            'message': 'Code is valid!'
        }

        return reponse
    else:
        return Response({'message': 'Code is invalid!'}, status=status.HTTP_400_BAD_REQUEST)

def refresh_token(user, old_token):
    try:
        payload = jwt.decode(old_token, os.getenv('JWT_KEY'), algorithms=['HS256'])
        new_token = jwt.encode(payload, os.getenv('JWT_KEY'), 'HS256')

        ValidToken.objects.filter(user=user).delete()
        ValidToken.objects.create(user=user, token=new_token)

        return new_token
    except jwt.ExpiredSignatureError:
        return None 
    
@api_view(['POST'])
def permission_verif(request, id):
    user = User.objects.filter(id=id).first()
    if not user:
        AuthenticationFailed('User not found!')
    
    user.enable_verified = not user.enable_verified
    user.last_verified = None
    user.save()

    result = True if user.enable_verified else False
    if result :
        message = 'EnableTo2FA'
    else :
        message = 'DisableTo2FA'
    return Response({'message': message})

    
    
@api_view(['GET'])
def is_token_valid(request, token):
    
    if ValidToken.objects.filter(token=token).exists():
        return Response(status=status.HTTP_200_OK)
    else:
        payload = jwt.decode(token, os.getenv('JWT_KEY'), algorithms=['HS256'])
        user = User.objects.filter(id=payload[id]).first()
        user.status = "offline"
        user.save()
        return Response(status=status.HTTP_404_NOT_FOUND)
@api_view(['GET'])
@jwt_auth_required
def fetch_user_data(request):
    user = request.user
    
    profile_image_url = user.profile_image.url if user.profile_image else None
    if user.is_authenticated:
        payload = { 
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'status': user.status,
            'profile_image_url': profile_image_url,
            'is_stud': user.is_stud,
        }
        return Response({'payload': payload})
    return Response({'error': 'Not authenticated'}, status=status.HTTP_403_FORBIDDEN)

@api_view(['GET'])
def check_auth(request):
    token = request.COOKIES.get('token')
    if not token:
        return Response({'isAuthenticated': False})

    try:
        payload = jwt.decode(token, os.getenv('JWT_KEY'), algorithms=['HS256'])
        user = User.objects.filter(id=payload['id']).first()
        if user:
            return Response({'isAuthenticated': True, 'user': {'id': user.id, 'name': user.name}})
        else:
            return Response({'isAuthenticated': False})
    except jwt.ExpiredSignatureError:
        return Response({'isAuthenticated': False, 'error': 'Token expired'})
    except jwt.InvalidTokenError:
        return Response({'isAuthenticated': False, 'error': 'Invalid token'})
