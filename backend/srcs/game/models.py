from django.db import models
from django.contrib.postgres.fields import ArrayField

class Game(models.Model):
    WAITING = 'waiting'
    STARTED = 'started'
    FINISHED = 'finished'
    READY = 'ready'

    STATUS_CHOICES = [
        (WAITING, 'Waiting for Players'),
        (STARTED, 'Game Started'),
        (FINISHED, 'Game Finished'),
        (READY, 'Ready waiting to start'),
    ]

    timeSeconds = models.IntegerField(default=0)
    timeMinutes = models.IntegerField(default=3)
    score_player_1 = models.IntegerField(default=0)
    score_player_2 = models.IntegerField(default=0)
    player1 = models.CharField(max_length=255, blank=True)
    player2 = models.CharField(max_length=255, blank=True)
    winner = models.CharField(max_length=255, blank=True)
    loser = models.CharField(max_length=255, blank=True)
    date = models.DateField(auto_now=True)

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default=WAITING
    )

    def __str__(self):
        return f"Game between {self.player1} and {self.player2} - Status: {self.status}"

    def is_waiting(self):
        return self.status == self.WAITING

    def has_started(self):
        return self.status == self.STARTED

    def has_finished(self):
        return self.status == self.FINISHED

class Tournament(models.Model):
    WAITING = 'waiting'
    STARTED = 'started'
    FINISHED = 'finished'
    READY = 'ready'

    STATUS_CHOICES = [
        (WAITING, 'Waiting for Players'),
        (STARTED, 'Tournament Started'),
        (FINISHED, 'Tournament Finished'),
        (READY, 'Ready waiting to start'),
    ]

    code = models.IntegerField(default=0)
    timeMaxMinutes = models.IntegerField(default=0)
    timeMaxSeconds = models.IntegerField(default=0)
    scoreMax = models.IntegerField(default=0)
    player1 = models.CharField(max_length=255, blank=True) 
    player2 = models.CharField(max_length=255, blank=True)
    player3 = models.CharField(max_length=255, blank=True)
    player4 = models.CharField(max_length=255, blank=True)
    gamesTournament = models.ManyToManyField("game.Game", related_name="tournament_players", blank=True)
    size = models.IntegerField(default=4)
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default=WAITING
    )