from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.timezone import now
from datetime import timedelta
from django.utils import timezone
import uuid
import datetime


class User(AbstractUser):
    name = models.CharField(max_length=255, unique=True)
    email = models.CharField(max_length=255, unique=True)
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)
    password = models.CharField(max_length=255, blank=True)
    friends = models.ManyToManyField("User", blank=True)
    status = models.CharField(max_length=20, default='offline')
    is_stud = models.BooleanField(max_length=255, default=False)
    games = models.ManyToManyField("game.Game", related_name="players", blank=True)
    tournament = models.ManyToManyField("game.Tournament", related_name="players", blank=True)
    is_verified = models.BooleanField(default=False)
    last_verified = models.DateTimeField(null=True, blank=True)
    is_waiting = models.BooleanField(default=False)
    enable_verified = models.BooleanField(default=False)
    ip_user = models.CharField(max_length=255, default="")

    username = None

    USERNAME_FIELD = 'name'
    REQUIRED_FIELDS = ['']
    
    
class ValidToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=500, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def clean_expired_tokens(self):
        expiration_time = now() - timedelta(hours=1)
        ValidToken.objects.filter(created_at__lt=expiration_time).delete()
        

class ConfirmationCode(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
