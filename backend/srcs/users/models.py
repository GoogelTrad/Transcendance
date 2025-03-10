from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.timezone import now
from datetime import timedelta
from django.utils import timezone
import uuid
import datetime
import os

class User(AbstractUser):
    name = models.CharField(max_length=32, unique=True)
    email = models.CharField(max_length=255, unique=True)
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)
    password = models.CharField(max_length=255, blank=True)
    friends = models.ManyToManyField("User", blank=True)
    status = models.CharField(max_length=20, default='offline')
    is_stud = models.BooleanField(max_length=255, default=False)
    games = models.ManyToManyField("game.Game", related_name="players", blank=True)
    tournament = models.ManyToManyField("game.Tournament", related_name="players", blank=True)
    is_verified = models.BooleanField(default=False)
    is_waiting = models.BooleanField(default=False)
    enable_verified = models.BooleanField(default=False)
    blocked_user = models.ManyToManyField("User", related_name="blocked_by", blank=True)

    username = None

    USERNAME_FIELD = 'name'
    REQUIRED_FIELDS = ['']
    
    
class ValidToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=500, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def clean_expired_tokens(self):
        token_time = int(os.getenv('TOKEN_TIME', '10'))
        expiration_time = timezone.now() - timedelta(seconds=token_time)
        
        expired_tokens = ValidToken.objects.filter(created_at__lt=expiration_time)
        if expired_tokens.exists():
            user_ids = expired_tokens.values_list('user__id', flat=True).distinct()
            User.objects.filter(id__in=user_ids).update(status="offline")
        
        deleted_count, _ = expired_tokens.delete()

    def is_expired(self):
        return timezone.now() > (self.created_at + timedelta(seconds=int(os.getenv('TOKEN_TIME'))))

    def delete(self, *args, **kwargs):
        self.user.status = "offline"
        self.user.save()
        super().delete(*args, **kwargs)

class ConfirmationCode(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
