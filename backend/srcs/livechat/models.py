from django.db import models
from django.contrib.auth.models import User

class ChatRoom(models.Model):
    """Modèle représentant une salle de chat."""
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name


class Message(models.Model):
    """Modèle représentant un message de chat."""
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    username = models.CharField(max_length=255)  # Peut être remplacé par un ForeignKey vers User
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'[{self.timestamp}] {self.username}: {self.content}'
