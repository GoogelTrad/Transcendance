from rest_framework import serializers
from users.serializer import BasicUserSerializer
from .models import Room, Message
from users.models import User

class RoomSerializer(serializers.ModelSerializer):
    users = BasicUserSerializer(read_only=True, many=True)
    class Meta:
        model = Room
        fields = ['id', 'name', 'creation', 'users', 'dm']

class UserConnectedSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name']

class MessageSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.name')

    class Meta:
        model = Message
        fields = ['user', 'content', 'timestamp']