from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import FriendRequest, User
from .serializer import FriendRequestSerializer, FriendSerializer
from rest_framework.exceptions import AuthenticationFailed
from django.http import HttpResponse
from users.decorator import jwt_auth_required
from users.serializer import UserSerializer

@api_view(['POST'])
@jwt_auth_required
def send_friend_request(request, user_id):
	
	if not request.user.is_authenticated:
		raise AuthenticationFailed('LoginRequiredForFriendRequest')

	try:
		to_user = User.objects.get(id=user_id)
	except User.DoesNotExist:
		return Response({"error": 'UserNotFound'}, status=status.HTTP_404_NOT_FOUND)

	if to_user == request.user:
		return Response({"error": 'CannotSendFriendRequestToSelf'}, status=status.HTTP_400_BAD_REQUEST)

	if to_user in request.user.friends.all():
		return Response({'error': 'AlreadyInFriendList'}, status=status.HTTP_400_BAD_REQUEST)

	if FriendRequest.objects.filter(from_user=request.user, to_user=to_user).exists():
		return Response({'error': 'FriendRequestAlreadySent'}, status=status.HTTP_400_BAD_REQUEST)

	if FriendRequest.objects.filter(from_user=to_user, to_user=request.user).exists():
		return Response({'error': 'FriendRequestAlreadyExists'}, status=status.HTTP_400_BAD_REQUEST)

	created = FriendRequest.objects.get_or_create(from_user=request.user, to_user=to_user)
	if created:
		return Response({'message': 'FriendRequestSent'}, status=status.HTTP_201_CREATED)
	return Response({'message': 'FriendRequestAlreadySent'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@jwt_auth_required
def accept_friend_request(request, request_id):
    
	if not request.user.is_authenticated:
		return Response({'error': 'LoginRequiredForAcceptFriendRequest'}, status=status.HTTP_401_UNAUTHORIZED)
	try:
		friend_request = FriendRequest.objects.get(id=request_id, to_user=request.user)
	except FriendRequest.DoesNotExist:
		return Response({'error': 'FriendRequestNotFound'}, status=status.HTTP_404_NOT_FOUND)


	friend_request.to_user.friends.add(friend_request.from_user)
	friend_request.from_user.friends.add(friend_request.to_user)

	friend_request.delete()

	return Response({'message': 'FriendRequestAccepted'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@jwt_auth_required
def decline_friend_request(request, request_id):
	if not request.user.is_authenticated:
		return Response({'error': 'LoginRequiredForAcceptFriendRequest'}, status=status.HTTP_401_UNAUTHORIZED)

	try:
		friend_request = FriendRequest.objects.get(id=request_id, to_user=request.user)
	except FriendRequest.DoesNotExist:
		return Response({'error': 'FriendRequestNotFound'}, status=status.HTTP_404_NOT_FOUND)

	friend_request.delete()

	return Response({'message': 'FriendRequestDeclined'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@jwt_auth_required
def friends_list(request, user_id):
    try:
        user = User.objects.prefetch_related('friends').get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'UserNotFound'}, status=404)

    serializer = UserSerializer(user)
    user_data = serializer.data
    filtered_user = {key: value for key, value in user_data.items() if key not in ['password']}
    return Response(filtered_user)

@api_view(['POST'])
@jwt_auth_required
def delete_friends(request, id):
    
	current_user = request.user

	try :
		to_delete = User.objects.get(id=id)
	except User.DoesNotExist:
		return Response({'error': 'UserNotFound'}, status=status.HTTP_404_NOT_FOUND)

	if to_delete not in current_user.friends.all():	
		return Response({'error': 'NotInYourFriendsList'}, status=status.HTTP_404_NOT_FOUND)

	current_user.friends.remove(to_delete)
	to_delete.friends.remove(current_user)

	return Response({'message': 'FriendsSuccesfullyRemoved'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@jwt_auth_required    
def get_friend_requests(request):    
	if not request.user.is_authenticated:
		return Response({'error': 'UserNotAuthenticated'}, status=status.HTTP_403_FORBIDDEN)

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
	return Response({'error': 'UserNotFound'}, status=status.HTTP_404_NOT_FOUND)
