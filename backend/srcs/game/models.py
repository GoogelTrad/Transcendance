from django.db import models

class Game():
    time = models.IntegerField()
    score = models.IntegerField()
    player1 = models.CharField(max_length=255)
    player2 = models.CharField(max_length=255)
    winner = models.CharField(max_length=255)
    loser = models.CharField(max_length=255)
