from django.db import models

class Game(models.Model):
    WAITING = 'waiting'
    STARTED = 'started'
    FINISHED = 'finished'

    STATUS_CHOICES = [
        (WAITING, 'Waiting for Players'),
        (STARTED, 'Game Started'),
        (FINISHED, 'Game Finished'),
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