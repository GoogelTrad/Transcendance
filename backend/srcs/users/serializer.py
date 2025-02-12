from rest_framework import serializers
from .models import User
from friends.serializer import FriendSerializer

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
    
    def validate(self, data):
        password = data.get('password')
        password_confirm = data.get('password_confirm')
        
        if password and password_confirm and password != password_confirm:
            raise serializers.ValidationError('Password does not match!')
        
        return data

    #pour hash le password
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

        # Mettre à jour les autres champs
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Hacher et mettre à jour le mot de passe si fourni
        if password is not None:
            instance.set_password(password)

        instance.save()
        return instance
        
        