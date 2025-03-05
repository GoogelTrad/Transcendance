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
    scoreMax = models.IntegerField(default=11)
    score_player_1 = models.IntegerField(default=0)
    score_player_2 = models.IntegerField(default=0)
    player1 = models.CharField(max_length=255, blank=True)
    player2 = models.CharField(max_length=255, blank=True)
    elo_Player1 = models.IntegerField(default=0)
    elo_Player2 = models.IntegerField(default=0)
    winner = models.CharField(max_length=255, blank=True)
    loser = models.CharField(max_length=255, blank=True)
    date = models.DateField(auto_now=True)
    isInTournament = models.BooleanField(default=False)
    tournamentCode = models.IntegerField(default=0)
    

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default=WAITING
    )
    
    def __str__(self):
        return f"Game between {self.player1} and {self.player2} - Status: {self.status}, Winner: {self.winner}, score player 1 : {self.score_player_1}, score player 2: {self.score_player_2}"

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
    winner1 = models.CharField(max_length=255, blank=True)
    winner2 = models.CharField(max_length=255, blank=True)
    winner_final = models.CharField(max_length=255, blank=True)
    players_connected = models.IntegerField(default=0)
    date = models.DateField(auto_now=True)
    first = models.CharField(max_length=255, blank=True)
    second = models.CharField(max_length=255, blank=True)
    third = models.CharField(max_length=255, blank=True)
    fourth = models.CharField(max_length=255, blank=True)
    tie = models.BooleanField(default=False)

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default=WAITING
    )