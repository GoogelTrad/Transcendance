from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.decorators import api_view, action
from .serializer import UserSerializer
from django.http import HttpResponse
from .models import User
import jwt


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
        
        profile_image_url = user.profile_image.url if user.profile_image else None
        
        payload = {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'profile_image_url': profile_image_url,
        }

        token = jwt.encode(payload, 'coucou', 'HS256')

        reponse = Response()

        reponse.set_cookie(key='token', value=token, max_age=3600)

        reponse.data = {
            'token': token
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
                return Response(serializer.data)
            
            elif request.method == 'PATCH':
                serializer = UserSerializer(user, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    profile_image_url = user.profile_image.url if user.profile_image else None
                    payload = {
                        'id': user.id,
                        'name': user.name,
                        'email': user.email,
                        'profile_image_url': profile_image_url,
                    }
                    reponse = Response()
                    reponse.delete_cookie('token')
                    token = jwt.encode(payload, 'coucou', 'HS256')
                    reponse.set_cookie(key='token', value=token, max_age=3600)
                    reponse.data = serializer.data;
                    
                    return reponse
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
            elif request.method == 'DELETE':
                user.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)

    @api_view(['POST'])
    def createUser(request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)   
        serializer.save()

        return Response(serializer.data)


class LogoutView():
    @api_view(['GET'])
    def logoutUser(request):
        reponse = Response()
        reponse.delete_cookie('token')
        reponse.data = {
            'message': 'success'
        }
        return reponse

        
# class LogoutView(APIView):
#     def post(self, request):
#         response = Response()
#         response.delete_cookie('jwt')
#         response.data = {
#             'message': 'success'
#         }

#         return response