from django.db import models
from users.models import User
from django.conf import settings
from django.core.exceptions import ValidationError

from django.core.validators import RegexValidator

class Room(models.Model):
    name_validator = RegexValidator(regex=r'^[0-9a-zA-Z]+$')

    creation = models.DateTimeField(auto_now_add=True)
    createur = models.ForeignKey(User, on_delete=models.PROTECT, related_name="rooms_create")
    users = models.ManyToManyField(User, related_name="rooms", blank=False)
    name = models.CharField(max_length=15, validators=[name_validator], blank=False, unique=True)
    dm = models.BooleanField(default=False)

    async def add_members(self, member):
        await self.users.aadd(member)

    def __str__(self):
        return f"Room privée créée par {self.createur.name} - {self.creation}"

class Message(models.Model):
    room = models.ForeignKey(Room, on_delete=models.DO_NOTHING, related_name='messages')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages', default="0")
    content = models.TextField(max_length=300)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'[{self.timestamp}] {self.username}: {self.content}'
