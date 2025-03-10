from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Room, Message
from .serializer import RoomSerializer, UserConnectedSerializer
from django.http import JsonResponse
import json
from users.decorator import jwt_auth_required
from users.models import User
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import status
from django.db.models import Count

@api_view(['GET'])
@jwt_auth_required
def get_me(request, room_name):
    dmname = None
    room = Room.objects.get(name=room_name)
    me = request.user
    if room.dm:
        friend = [user for user in room.users.all() if user.id != me.id]
        dmname = friend[0].name + ' dm'
    return Response({
        "creation": room.creation,
        "createur": room.createur.id,
        "name": room.name,
        "dmname": dmname
    })

@api_view(['GET'])
@jwt_auth_required
def get_list_rooms(request):
    user = request.user

    rooms = Room.objects.all()
    dmRooms = Room.objects.filter(dm=True, users=user)

    rooms = rooms.filter(dm=False)
    roomSerializer = RoomSerializer(rooms, many=True)
    dmSerializer = RoomSerializer(dmRooms, many=True)
    return Response({"publicRooms": roomSerializer.data, "dmRooms": dmSerializer.data})

@api_view(['GET'])
def get_list_users(request, name):
    try:
        room = Room.objects.get(name=name)
        users = room.users.all()
        users_data = [{"id": user.id,"username": user.name} for user in users]
        return Response(users_data, status=status.HTTP_200_OK)
    except:
        return Response({"error": "Room introuvable."}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['GET'])
@jwt_auth_required
def get_users_connected(request):
    try:
        user_id = request.user.id
        users = User.objects.all()
        serializer = UserConnectedSerializer(users, many=True)

        filtered_user = [usr for usr in serializer.data if usr['id'] != user_id]

        return Response(filtered_user)
    except:
        return Response({"error": "Users connected not found."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@jwt_auth_required
def save_chat_msg(request):
    data = json.loads(request.body)
    # Message.asave()
    return Response(status=status.HTTP_200_OK)

@api_view(['POST'])
@jwt_auth_required
def exit_room(request):
    if not request.user.is_authenticated:
        return JsonResponse({'success': False, 'message': 'Utilisateur non authentifié'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        data = json.loads(request.body)
        room_name = data.get('room_name')
        user = request.user

        room = Room.objects.get(name=room_name)

        if user not in room.users.all():
            return JsonResponse({'success': False, 'message': 'L\'utilisateur n\'est pas dans cette salle'}, status=status.HTTP_400_BAD_REQUEST)
        
        room.users.remove(user)

        return JsonResponse({'success': True, 'message': 'Utilisateur retiré de la salle avec succès'})

    except Room.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Salle non trouvée'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return JsonResponse({'success': False, 'message1': str(e)}, status=status.HTTP_404_NOT_FOUND)

@jwt_auth_required
def envoyer_invitation(request, user_id):
    try:
        receveur = User.objects.get(id=user_id)
        send_notification(receveur, f"{request.user.username} vous a envoyé une invitation.")
        return JsonResponse({"success": True})
    except User.DoesNotExist:
        return JsonResponse({"error": "Utilisateur introuvable"}, status=status.HTTP_404_NOT_FOUND)

def send_notification(user, message):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"user_{user.id}",
        {
            "type": "send_notification",
            "message": message,
        },
    )

    return JsonResponse({"status": "Notification envoyée"})


@api_view(['POST'])
@jwt_auth_required
def block_user(request):
    from_user = request.data.get('from_user')
    to_user = request.data.get('to_user')

    if not from_user or not to_user:
        return Response(
            {"error": "Les champs 'from_user' et 'to_user' sont requis"},
            status=status.HTTP_400_BAD_REQUEST
        )

    from_user_id = User.objects.filter(id=from_user).first()
    if not from_user_id:
        return Response({'error': 'User not found!'}, status=status.HTTP_404_NOT_FOUND)

    to_user_id = User.objects.filter(id=to_user).first()
    if not to_user_id:
        return Response({'error': 'User not found!'}, status=status.HTTP_404_NOT_FOUND)

    from_user_id.blocked_user.add(to_user_id)
    from_user_id.save()

    return Response(
        {'message': 'Utilisateur bloqué avec succès !'},
        status=status.HTTP_200_OK
    )

@api_view(['POST'])
@jwt_auth_required
def unlock_user(request):
    from_user = request.data['from_user']
    to_user = request.data['to_user']

    user = User.objects.filter(id=from_user).first()

    if user is None:
        return Response({'error': 'User not found!'}, status=status.HTTP_404_NOT_FOUND)

    blocked = User.objects.filter(id=to_user).first()

    if blocked is None:
        return Response({'error': 'User not found!'}, status=status.HTTP_404_NOT_FOUND)

    user.blocked_user.remove(blocked)
    user.save()

    return Response({'message': 'Unlock user request accepted!'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@jwt_auth_required
def get_list_blocked(request, id):
    users = User.objects.filter(id=id).first()

    if users is None:
        return Response({'error': 'User not found!'}, status=status.HTTP_404_NOT_FOUND)
    response = Response()

    response.data = list(users.blocked_user.values_list('id', flat=True))

    return response
