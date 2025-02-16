from django.db import models
from users.models import User
from django.core.exceptions import ValidationError


class Room(models.Model):
    """Modele representant une salle de chat prive"""
    creation = models.DateTimeField(auto_now_add=True)
    createur = models.ForeignKey(User, on_delete=models.PROTECT, related_name="rooms_create")
    password = models.CharField(max_length=255, blank=True, null=True)
    users = models.ManyToManyField(User, related_name="rooms", blank=False)
    name = models.CharField(max_length=255, blank=False, unique=True)

    async def add_members(self, member):
        """Ajoute un utilisateur à la room s'il y a moins de 5 participants."""
        if await self.users.acount() >= 5:
            raise ValidationError("Cette room est déjà pleine (limite de 5 participants).")
        await self.users.aadd(member)

    def __str__(self):
        return f"Room privée créée par {self.createur.username} - {self.creation}"


class Message(models.Model):
    """Modèle représentant un message de chat."""
    room = models.ForeignKey(Room, on_delete=models.DO_NOTHING, related_name='messages')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages', default="0")
    content = models.TextField(max_length=300)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'[{self.timestamp}] {self.username}: {self.content}'

class DirectMessage(models.Model):
    """Modele representant une discussion privee entre deux utilisateurs"""
    createur = models.ForeignKey(User, on_delete=models.PROTECT, related_name="rooms_createur")
    invite = models.ForeignKey(User, on_delete=models.PROTECT, related_name="rooms_invite")
    accepte = models.BooleanField(default=False)
    creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Room privée créée par {self.createur.username} - {self.creation}"
