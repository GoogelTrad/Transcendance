from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.decorators import api_view, action
from django.shortcuts import get_object_or_404
from .serializer import GameSerializer, TournamentSerializer
from django.http import HttpResponse
from .models import Game, Tournament
from users.models import User
import jwt
import os
from users.decorator import jwt_auth_required
import random

class HomeGameView:
    @api_view(['POST'])
    def create_game(request):
        data = request.data.copy()

        serializer = GameSerializer(data=data, partial=True)

        if serializer.is_valid():
            game_instance = serializer.save()
            player1_name = data.get('player1')
            if player1_name:
                try:
                    player1_user = get_object_or_404(User, name=player1_name)
                    player1_user.games.add(game_instance)
                    player1_user.save()
                except Exception as e:
                    return Response({"detail": f"Player1 with name '{player1_name}' not found: {str(e)}"}, status=status.HTTP_404_NOT_FOUND)
            player2_name = data.get('player2')
            if player2_name:
                try:
                    player2_user = get_object_or_404(User, name=player2_name)
                    player2_user.games.add(game_instance)
                    player2_user.save()
                except Exception as e:
                    return Response({"detail": f"Player2 with name '{player2_name}' not found: {str(e)}"}, status=status.HTTP_404_NOT_FOUND)
                

            return Response({"id": game_instance.id, **serializer.data}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



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
    
    @api_view(['GET'])
    def fetch_data_user(request, user_id):
        try:
            user = User.objects.get(id=user_id)

            games = user.games.all().order_by('-date')
            #games = games.games.exclude(status='aborted')
            game_serializer = GameSerializer(games, many=True)

            return Response(game_serializer.data, status=status.HTTP_200_OK)
    
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        
    @api_view(['POST'])
    def GameDetails(request):

        name = request.data.get('name')
        
        payload = {
            'name'  : name,
        }

        token = jwt.encode(payload, os.getenv('JWT_KEY'), 'HS256')

        response = Response()

        response.set_cookie(key='token', value=token, max_age=int(os.getenv('TOKEN_TIME')), httponly=True, secure=True, samesite='None')

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

class TournamentView:
    @api_view(['POST'])
    def create_tournament(request):
        token = request.COOKIES.get('token')
        payload = jwt.decode(jwt=token, key=os.getenv('JWT_KEY'), algorithms=['HS256'])
        user = get_object_or_404(User, name=payload.get('name'))
        data = request.data.copy()
        verif_tournament = Tournament.objects.count()
        print(verif_tournament, flush=True)
        if verif_tournament >= 100 :
            tournament_to_del = Tournament.objects.first()
            tournament_to_del.delete()
            verif_tournament = Tournament.objects.count()
        tournament_code = random.randint(100, 9999)

        if Tournament.objects.filter(code=tournament_code).exists():
            tournament_code_save = tournament_code
            while tournament_code == tournament_code_save:
                tournament_code = random.randint(100, 9999)
        print(tournament_code, flush=True)
        data["code"] = tournament_code
        print(data["code"], flush=True)
        serializer = TournamentSerializer(data=data, partial=True)

        if serializer.is_valid():
            tournament_instance = serializer.save()

            user.tournament.add(tournament_instance)
            user.save()

            return Response({"id": tournament_instance.id, **serializer.data}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @api_view(['GET', 'PATCH'])
    def fetch_data_tournament(request, tournament_id):
        try:
            tournament = Tournament.objects.get(pk=tournament_id)
        except Tournament.DoesNotExist:
            return Response({"error": "Tournament not found"}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'GET':
            serializer = TournamentSerializer(tournament)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == 'PATCH':
            serializer = TournamentSerializer(tournament, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(TournamentSerializer(tournament).data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    @api_view(['GET', 'PATCH'])
    @jwt_auth_required
    def fetch_data_tournament_by_code(request, code):
        try:
            tournament = Tournament.objects.get(code=code)
        except Tournament.DoesNotExist:
            return Response({"error": "Tournament not found"}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'GET':
            serializer = TournamentSerializer(tournament)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == 'PATCH':
            if 'winner' in request.data:
                games = list(tournament.gamesTournament.all().order_by('id'))
                print("games states :", games, flush=True)
                if len(games) >= 1:
                    tournament.winner1 = games[0].winner
                if len(games) >= 2:
                    tournament.winner2 = games[1].winner
                if len(games) == 3:
                    score_game_1 = min(games[0].score_player_1, games[0].score_player_2)
                    score_game_2 = min(games[1].score_player_1, games[1].score_player_2)
                    if score_game_1 < score_game_2:
                        tournament.fourth = games[0].loser
                        tournament.third = games[1].loser
                    if score_game_1 > score_game_2:
                        tournament.fourth = games[1].loser
                        tournament.third = games[0].loser
                    if score_game_1 == score_game_2:
                        tournament.fourth = games[1].loser
                        tournament.third = games[0].loser
                        tournament.tie = True
                    tournament.winner_final = games[2].winner
                    tournament.first = games[2].winner
                    tournament.second = games[2].loser
            serializer = TournamentSerializer(tournament, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(TournamentSerializer(tournament).data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    @api_view(['PATCH'])
    def add_player_to_tournament(request, code):
        try:
            tournament = Tournament.objects.get(code=code)

            player_name = request.data.get('player_name')

            if player_name in [tournament.player1, tournament.player2, tournament.player3, tournament.player4]:
                return Response({"error": "Player is already registered in the tournament"}, status=status.HTTP_409_CONFLICT)
            
            data_to_patch = {}

            if not tournament.player2:
                data_to_patch['player2'] = request.data.get('player2', None)
                if tournament.size == 2:
                    data_to_patch['status'] = "ready"
            elif not tournament.player3:
                data_to_patch['player3'] = request.data.get('player3', None)
            elif not tournament.player4:
                data_to_patch['player4'] = request.data.get('player4', None)
                data_to_patch['status'] = "ready"
            else:
                return Response({"error": "Tournament is full"}, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = TournamentSerializer(tournament, data=data_to_patch, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Tournament.DoesNotExist:
            return Response({"error": "Tournament not found"}, status=status.HTTP_404_NOT_FOUND)

    @api_view(['GET'])
    def fetch_data_tournament_by_user(request, user_id):
        try:
            user = User.objects.get(id=user_id)

            tournament = user.tournament.all().order_by('-date')
        
            tournament_serializer = TournamentSerializer(tournament, many=True)

            return Response(tournament_serializer.data, status=status.HTTP_200_OK)
    
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)