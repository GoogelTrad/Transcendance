from django.db import models

class Game():
    time = models.IntegerField()
    score = models.IntegerField()
    players = models.CharField(max_length=255)
    winner = models.CharField(max_length=255)
    looser = models.CharField(max_length=255)
