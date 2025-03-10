from rest_framework import serializers
from .models import Game, Tournament

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['id', 'date', 'timeSeconds', 'timeMinutes', 'scoreMax' ,'score_player_1', 'score_player_2', 'player1', 'player2', 'winner', 'loser', 'status', 'isInTournament', 'tournamentCode', 'IA']

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = ['id', 'code', 'timeMaxMinutes', 'timeMaxSeconds', 'scoreMax', 'player1', 'player2', 'player3', 'player4', 'winner3' ,'size','player1co','player2co','player3co','player4co', 'gamesTournament', 'status',  'winner1',  'winner2', 'winner_final', 'players_connected', 'date', 'first', 'second', 'third', 'fourth', 'tie']
