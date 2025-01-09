from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import FriendRequest, User
from .serializer import FriendRequestSerializer, FriendSerializer
from rest_framework.exceptions import AuthenticationFailed
from django.http import HttpResponse
from users.decorator import jwt_auth_required
from users.serializer import UserSerializer

# Create your views here.

@api_view(['POST'])
@jwt_auth_required
def send_friend_request(request, user_id):
	
	if not request.user.is_authenticated:
		raise AuthenticationFailed('You must be connected to send friends request!')

	try:
		to_user = User.objects.get(id=user_id)
	except User.DoesNotExist:
		return Response({"error":"User not found!"}, status=status.HTTP_404_NOT_FOUND)

	if to_user == request.user:
		return Response({"error":"You cannot send friend request to yourself!"}, status=status.HTTP_400_BAD_REQUEST)

	if to_user in request.user.friends.all():
		return Response({'error':'Already in friend list'}, status=status.HTTP_400_BAD_REQUEST)

	if FriendRequest.objects.filter(from_user=request.user, to_user=to_user).exists():
		return Response({'error': 'Friend request already sent!'}, status=status.HTTP_400_BAD_REQUEST)

	if FriendRequest.objects.filter(from_user=to_user, to_user=request.user).exists():
		return Response({'error': 'A friend request from this user already exists!'}, status=status.HTTP_400_BAD_REQUEST)

	created = FriendRequest.objects.get_or_create(from_user=request.user, to_user=to_user)
	if created:
		return Response({'message': 'Friend request sent!'}, status=status.HTTP_201_CREATED)
	return Response({'message': 'Friends request already sent!'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@jwt_auth_required
def accept_friend_request(request, request_id):
    
	if not request.user.is_authenticated:
		raise AuthenticationFailed('You must be connected to accept friends request!')
	try:
		friend_request = FriendRequest.objects.get(id=request_id, to_user=request.user)
	except FriendRequest.DoesNotExist:
		return Response({'error': 'Friend Request not found!'}, status=status.HTTP_404_NOT_FOUND)


	friend_request.to_user.friends.add(friend_request.from_user)
	friend_request.from_user.friends.add(friend_request.to_user)

	friend_request.delete()

	return Response({'message': 'Friend request accepted!'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@jwt_auth_required
def decline_friend_request(request, request_id):
	if not request.user.is_authenticated:
		raise AuthenticationFailed('You must be connected to accept friends request!')

	try:
		friend_request = FriendRequest.objects.get(id=request_id, to_user=request.user)
	except FriendRequest.DoesNotExist:
		return Response({'error': 'Friend Request not found!'}, status=status.HTTP_404_NOT_FOUND)

	friend_request.delete()

	return Response({'message': 'Friend request declined!'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@jwt_auth_required
def friends_list(request, user_id):
    try:
        user = User.objects.prefetch_related('friends').get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

    serializer = UserSerializer(user)
    return Response(serializer.data)

@api_view(['POST'])
@jwt_auth_required
def delete_friends(request, id):
    
	current_user = request.user

	try :
		to_delete = User.objects.get(id=id)
	except User.DoesNotExist:
		return Response({'error': 'User nt found'}, status=404)

	if to_delete not in current_user.friends.all():	
		return Response({'error': 'User not in your friends list'}, status=404)

	current_user.friends.remove(to_delete)
	to_delete.friends.remove(current_user)

	return Response({'message': 'Friends succesfully removed!'}, status=200)

@api_view(['GET'])
@jwt_auth_required    
def get_friend_requests(request):    
	if not request.user.is_authenticated:
		return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

	friend_requests = FriendRequest.objects.filter(to_user=request.user)
	serializer = FriendRequestSerializer(friend_requests, many=True)
    
	return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@jwt_auth_required
def searchAddFriend(request, name):
	user = User.objects.filter(name__startswith=name).exclude(id=request.user.id)
	if user.exists():
		serializer = UserSerializer(user, many=True)
		user_data = []
		for user in serializer.data:
			filtered_user = {key: value for key, value in user.items() if key not in ['password', 'email']}
			user_data.append(filtered_user)
		return Response(user_data)
	return Response({'error': 'User not found!'}, status=status.HTTP_404_NOT_FOUND)
