from rest_framework import serializers
from .models import FriendRequest, User

class FriendRequestSerializer(serializers.ModelSerializer):
    from_user_name = serializers.CharField(source='from_user.name', read_only=True)
    from_user_email = serializers.EmailField(source='from_user.email', read_only=True)

    class Meta:
        model = FriendRequest
        fields = ['id', 'from_user_name', 'from_user_email', 'created_at']
        
class FriendSerializer(serializers.ModelSerializer):
    profile_image_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'profile_image', 'profile_image_url', 'status', 'is_stud']

    def get_profile_image_url(self, obj):
        if obj.profile_image:
            return obj.profile_image.url
        return None
