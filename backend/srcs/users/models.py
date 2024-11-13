from django.db import models

# Create your models here.
class Users(models.Model):
    pseudo = models.CharField(max_length=16, blank=False, unique=True)
    mail = models.EmailField(blank=False, unique=True)
    password = models.CharField(max_length=250, blank=True)
    pp = models.ImageField(upload_to="profile_pic/", blank=True)
    
    