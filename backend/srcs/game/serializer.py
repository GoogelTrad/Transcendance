from rest_framework import serializers
from .models import Game

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['id', 'time', 'score1', 'score2', 'player1', 'player2', 'winner', 'loser', 'player1_paddle_x', 'player1_paddle_y', 'player2_paddle_x', 'player2_paddle_y']
