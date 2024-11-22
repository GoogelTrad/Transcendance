from rest_framework import serializers
from .models import Game

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['time', 'score', 'player1', 'player2', 'winner', 'loser']
