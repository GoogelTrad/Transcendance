from rest_framework import serializers
from .models import Game

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['id', 'timeSeconds', 'timeMinutes', 'score_player_1', 'score_player_2', 'player1', 'player2', 'winner', 'loser', 'status']
