from django.db import models

class Game(models.Model):
    timeSeconds = models.IntegerField(default=59)
    timeMinutes = models.IntegerField(default=2)
    score_player_1 = models.IntegerField(default=0)
    score_player_2 = models.IntegerField(default=0)
    player1 = models.CharField(max_length=255, blank=True)
    player2 = models.CharField(max_length=255, blank=True)
    winner = models.CharField(max_length=255, blank=True)
    loser = models.CharField(max_length=255, blank=True)

