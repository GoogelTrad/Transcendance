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
    @api_view(['POST'])
    def create_game(request):
        serializer = GameSerializer(data=request.data)
        if serializer.is_valid():
            game_instance = serializer.save()
            return Response({"id": game_instance.id, **serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GameView:

    @api_view(['GET', 'PATCH'])
    def fetch_data(request, game_id):
        if request.method == 'GET':
            try:
                game = Game.objects.get(pk=game_id)
            except Game.DoesNotExist:
                return Response({"error": "Game not found"}, status=status.HTTP_404_NOT_FOUND)
            serializer = GameSerializer(game)
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif request.method == 'PATCH':
            try:
                game = Game.objects.get(id=game_id)
                serializer = GameSerializer(game, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except Game.DoesNotExist:
                return Response({"error": "Game not found"}, status=status.HTTP_404_NOT_FOUND)

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



        




        
        
