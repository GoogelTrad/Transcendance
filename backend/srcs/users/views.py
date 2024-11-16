from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate, login
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .forms import RegisterForm
from .forms import LoginForm

class RegisterView(APIView):
    def post(self, request, *args, **kwargs):
        form = RegisterForm(request.data, request.FILES)
        
        if form.is_valid():
            user = form.save(commit=False)
            user.password = make_password(user.password)  # Hash du mot de passe
            user.save()

            return Response({
                "message": "User registered successfully!",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                }
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)

class loginView(APIView):
    def post(self, request, *args, **kwargs):
        form = LoginForm(request.data, request.FILES)

        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']

            user = authenticate(request=request, username=username, password=password)
            
            if user is not None:
                login(request, user)
                return Response({
                    "message": "User login successfully!",
                    "user": {
                        "id": user.id,
                        "username": user.username, 
                    }
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    "message": "Invalid credentials"
                }, status=status.HTTP_400_BAD_REQUEST)

        return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)
    
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }