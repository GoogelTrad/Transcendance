from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.decorators import api_view, action
from .serializer import GameSerializer
from django.http import HttpResponse
from .models import Game
import jwt

class HomeGameView:
    @api_view(['GET'])
    def home_page(APIView):
        return Response()
        

class GameView:
    @api_view(['POST'])
    def keep_score(request):
        serializer = GameSerializer(data=request.data)
        if serializer.is_valid():
            game_instance = serializer.save()
            response_data = serializer.data
            response_data['id'] = game_instance.id
            return Response(response_data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @api_view(['POST'])
    def GameDetails(request):

        name = request.data.get('name')
        
        payload = {
            'name'  : name,
        }

        token = jwt.encode(payload, 'coucou', 'HS256')

        response = Response()

        response.set_cookie(key='token', value=token, max_age=3600)

        response.data = {
            'token' : token
        }
        return Response()
        
    @api_view(['GET'])
    def GameTest(request):
        reponse = Response()
        reponse.delete_cookie('token')
        reponse.data = {
            'message': 'success'
        }
        return reponse



        




        
        
