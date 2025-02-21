from rest_framework import serializers
from users.serializer import BasicUserSerializer
from .models import Room
from users.models import User

class RoomSerializer(serializers.ModelSerializer):
    users = BasicUserSerializer(read_only=True, many=True)
    class Meta:
        model = Room
        fields = ['id', 'name', 'creation', 'password', 'users', 'dm']

class UserConnectedSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name']
