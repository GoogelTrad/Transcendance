from rest_framework import serializers
from .models import User
from friends.serializer import FriendSerializer
from django.core.exceptions import ValidationError
import re

class UserSerializer(serializers.ModelSerializer):
    friends = FriendSerializer(many=True, read_only=True)
    password_confirm = serializers.CharField(max_length=255, write_only=True)
    profile_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'status', 'password', 'password_confirm', 'profile_image', 'profile_image_url', 'friends', 'is_stud', 'is_waiting']
        
    def get_profile_image_url(self, obj):
        if obj.profile_image:
            return obj.profile_image.url
        return None   
    
    def validate_password(self, password):
        if len(password) < 8:
            raise ValidationError("Le mot de passe doit contenir au moins 8 caractères.")
        if not any(char.isupper() for char in password):
            raise ValidationError("Le mot de passe doit contenir au moins une majuscule.")
        if not any(char.islower() for char in password):
            raise ValidationError("Le mot de passe doit contenir au moins une minuscule.")
        if not any(char.isdigit() for char in password):
            raise ValidationError("Le mot de passe doit contenir au moins un chiffre.")
        if not re.search(r"[@$!%*?&]", password):
            raise ValidationError("Le mot de passe doit contenir au moins un caractère spécial (@$!%*?&).")

    def validate(self, data):
        password = data.get('password')
        password_confirm = data.get('password_confirm')
        
        if password and password_confirm and password != password_confirm:
            raise serializers.ValidationError('Password does not match!')
        
        return data

    def create(self, validated_data):
        password_confirm = validated_data.pop('password_confirm')
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        
        instance.save()
        return instance

    def update(self, instance, validated_data):
        validated_data.pop('password_confirm', None)
        password = validated_data.pop('password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password is not None:
            instance.set_password(password)

        instance.save()
        return instance
        
class BasicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email']