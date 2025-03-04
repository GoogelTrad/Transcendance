from rest_framework import serializers
from .models import Game, Tournament

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['id', 'date', 'timeSeconds', 'timeMinutes', 'scoreMax' ,'score_player_1', 'score_player_2', 'player1', 'player2', 'winner', 'loser', 'status', 'elo_Player1', 'elo_Player2', 'isInTournament', 'tournamentCode']

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = ['id', 'code', 'timeMaxMinutes', 'timeMaxSeconds', 'scoreMax', 'player1', 'player2', 'player3', 'player4', 'size', 'gamesTournament', 'status',  'winner1',  'winner2', 'players_connected']
