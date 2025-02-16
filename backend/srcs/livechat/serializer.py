from rest_framework import serializers
from .models import Room
from users.models import User

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['id', 'name', 'creation', 'password']

class UserConnectedSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name']
