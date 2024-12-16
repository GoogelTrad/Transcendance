from django.db import models
from users.models import User
from django.core.exceptions import ValidationError

class ChatRoom(models.Model):
    """Modèle représentant une salle de chat."""
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name


class Message(models.Model):
    """Modèle représentant un message de chat."""
    room = models.ForeignKey(ChatRoom, on_delete=models.DO_NOTHING, related_name='messages')
    username = models.CharField(max_length=255)  # Peut être remplacé par un ForeignKey vers User
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'[{self.timestamp}] {self.username}: {self.content}'

class Room(models.Model):
    """Modele representant une salle de chat prive"""
    creation = models.DateTimeField(auto_now_add=True)
    createur = models.ForeignKey(User, on_delete=models.PROTECT, related_name="rooms_create")
    password = models.CharField(max_length=255, blank=True, null=True)
    users = models.ManyToManyField(User, related_name="users", blank=False)

    async def add_members(self, member):
        """
        Ajoute un utilisateur à la room s'il y a moins de 5 participants.
        """
        if await self.users.acount() >= 5:
            raise ValidationError("Cette room est déjà pleine (limite de 5 participants).")
        await self.users.aadd(member)

    def __str__(self):
        return f"Room privée créée par {self.createur.username} - {self.creation}"