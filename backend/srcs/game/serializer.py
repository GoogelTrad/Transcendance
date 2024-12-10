from rest_framework import serializers
from .models import Game

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['id', 'time', 'score1', 'score2', 'player1', 'player2', 'winner', 'loser']
