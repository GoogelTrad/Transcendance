from django.db import models

class Game(models.Model):
    time = models.IntegerField(default=0)
    score1 = models.IntegerField(default=0)
    score2 = models.IntegerField(default=0)
    player1 = models.CharField(max_length=255, blank=True)
    player2 = models.CharField(max_length=255, blank=True)
    winner = models.CharField(max_length=255, blank=True)
    loser = models.CharField(max_length=255, blank=True)
    player1_paddle_x = models.IntegerField(default=0)
    player1_paddle_y = models.IntegerField(default=0)
    player2_paddle_x = models.IntegerField(default=0)
    player2_paddle_y = models.IntegerField(default=0)
