from rest_framework import serializers
from users.serializer import BasicUserSerializer
from .models import Room, Message
from users.models import User

class RoomSerializer(serializers.ModelSerializer):
    users = BasicUserSerializer(read_only=True, many=True)
    class Meta:
        model = Room
        fields = ['id', 'name', 'creation', 'password', 'users', 'dm']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        
        instance.save()
        return instance

class UserConnectedSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name']

class MessageSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.name')

    class Meta:
        model = Message
        fields = ['user', 'content', 'timestamp']