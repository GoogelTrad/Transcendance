from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.decorators import api_view, action
from django.shortcuts import get_object_or_404
from .serializer import GameSerializer
from django.http import HttpResponse
from .models import Game
from users.models import User
import jwt

class HomeGameView:
    @api_view(['POST'])
    def create_game(request):
        auth_header = request.headers.get('Authorization')
        if auth_header:
            token = auth_header.split(' ')[1]
        else:
            token = None
        payload = jwt.decode(jwt=token, key='coucou', algorithms=['HS256'])
        user = get_object_or_404(User, name=payload.get('name'))
        request.data['player1'] = payload.get('name')
        serializer = GameSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            game_instance = serializer.save()
            user.games.add(game_instance)
            user.save()
            return Response({"id": game_instance.id, **serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    @api_view(['POST'])
    def create_game_multi(request):
        auth_header = request.headers.get('Authorization')
        if auth_header:
            token = auth_header.split(' ')[1]
        else:
            token = None
        payload = jwt.decode(jwt=token, key='coucou', algorithms=['HS256'])
        user = get_object_or_404(User, name=payload.get('name'))
        user.is_waiting = True
        user.save()
        waiting_players = User.objects.filter(is_waiting=True)
        is_InGame = Game.objects.filter(player2=user, status='STARTED')
        print("hey : ",is_InGame.count(), flush=True)
        if is_InGame.count() == 1:
            return Response({"id": is_InGame.first().id})
        if waiting_players.count() < 2:
            return Response({"message": "Waiting for another player..."}, status=200)
        player1 = waiting_players[0]
        player2 = waiting_players[1]
        request.data['player1'] = player1.name
        request.data['player2'] = player2.name
        serializer = GameSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            game_instance = serializer.save()
            player1.is_waiting = False
            player2.is_waiting = False
            player1.save()
            player2.save()
            game_instance.status = 'STARTED'
            game_instance.save()
            return Response({"id": game_instance.id, **serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @api_view(['GET'])
    def game_status(request, game_id):
        game = get_object_or_404(Game, id=game_id)
        return Response({"status": game.status}, status=200)

class GameView:

    @api_view(['GET', 'PATCH'])
    def fetch_data(request, game_id):
        try:
            game = Game.objects.get(pk=game_id)
        except Game.DoesNotExist:
            return Response({"error": "Game not found"}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'GET':
            serializer = GameSerializer(game)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == 'PATCH':
            serializer = GameSerializer(game, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(GameSerializer(game).data, status=status.HTTP_200_OK)
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



        




        
        
