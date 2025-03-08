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
        print("FRIEND:", friend, flush=True)
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
    print("user:", user, flush=True)

    rooms = Room.objects.all()
    dmRooms = Room.objects.filter(dm=True, users=user)

    print("rooms:", dmRooms, flush=True)
    rooms = rooms.filter(dm=False)
    roomSerializer = RoomSerializer(rooms, many=True)
    dmSerializer = RoomSerializer(dmRooms, many=True)
    print("dmSerializer:", dmSerializer, flush=True)
    return Response({"publicRooms": roomSerializer.data, "dmRooms": dmSerializer.data})

@api_view(['GET'])
def get_list_users(request, name):
    try:
        room = Room.objects.get(name=name)
        users = room.users.all()
        users_data = [{"id": user.id,"username": user.name} for user in users]
        return Response(users_data, status=200)
    except:
        return Response({"error": "Room introuvable."}, status=404)
    
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
        return Response({"error": "Users connected not found."}, status=404)

@api_view(['POST'])
@jwt_auth_required
def save_chat_msg(request):
    data = json.loads(request.body)
    print(data, flush=True)
    # Message.asave()
    return Response(status=200)

@api_view(['POST'])
@jwt_auth_required
def exit_room(request):
    if not request.user.is_authenticated:
        return JsonResponse({'success': False, 'message': 'Utilisateur non authentifié'}, status=401)
    
    try:
        data = json.loads(request.body)
        room_name = data.get('room_name')
        user = request.user

        room = Room.objects.get(name=room_name)

        if user not in room.users.all():
            return JsonResponse({'success': False, 'message': 'L\'utilisateur n\'est pas dans cette salle'}, status=400)
        
        room.users.remove(user)

        return JsonResponse({'success': True, 'message': 'Utilisateur retiré de la salle avec succès'})

    except Room.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Salle non trouvée'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'message1': str(e)}, status=500)

@jwt_auth_required
def envoyer_invitation(request, user_id):
    try:
        receveur = User.objects.get(id=user_id)
        send_notification(receveur, f"{request.user.username} vous a envoyé une invitation.")
        return JsonResponse({"success": True})
    except User.DoesNotExist:
        return JsonResponse({"error": "Utilisateur introuvable"}, status=404)

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
    from_user = request.data['from_user']
    to_user = request.data['to_user']

    user = User.objects.filter(id=from_user).first()

    if user is None:
        raise AuthenticationFailed("User not found")

    blocked = User.objects.filter(id=to_user).first()

    if blocked is None:
        raise AuthenticationFailed("User not found")

    user.blocked_user.add(blocked)
    user.save()

    return Response({'message': 'Block user request accepted!'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@jwt_auth_required
def unlock_user(request):
    from_user = request.data['from_user']
    to_user = request.data['to_user']

    user = User.objects.filter(id=from_user).first()

    if user is None:
        raise AuthenticationFailed("User not found")

    blocked = User.objects.filter(id=to_user).first()

    if blocked is None:
        raise AuthenticationFailed("User not found")

    user.blocked_user.remove(blocked)
    user.save()

    return Response({'message': 'Unlock user request accepted!'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@jwt_auth_required
def get_list_blocked(request, id):
    users = User.objects.filter(id=id).first()

    if users is None:
        raise AuthenticationFailed("User not found")


    response = Response()

    response.data = list(users.blocked_user.values_list('id', flat=True))

    return response
