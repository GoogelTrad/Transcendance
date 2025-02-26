from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Room, Message, BlockedUser
from .serializer import RoomSerializer, UserConnectedSerializer, BlockedUSerSerializer
from django.http import JsonResponse
import json
from users.decorator import jwt_auth_required
from users.models import User
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.shortcuts import get_object_or_404

@api_view(['GET'])
@jwt_auth_required
def get_list_rooms(request):
    print(request.user.id, flush=True)
    rooms = Room.objects.all()
    dmRooms = rooms.filter(dm=True)
    rooms = rooms.filter(dm=False)
    roomSerializer = RoomSerializer(rooms, many=True)
    dmSerializer = RoomSerializer(dmRooms, many=True)
    return Response({"publicRooms": roomSerializer.data, "dmRooms": dmSerializer.data})

@api_view(['GET'])
def get_dm_already_exist(request):
    rooms = Room.objects.all()


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
        users = User.objects.all()
        serializer = UserConnectedSerializer(users, many=True)
        return Response(serializer.data)
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
    print("Début de la requête exit_room", flush=True)
    if not request.user.is_authenticated:
        print("Utilisateur non authentifié", flush=True)
        return JsonResponse({'success': False, 'message': 'Utilisateur non authentifié'}, status=401)
    
    try:
        data = json.loads(request.body)
        room_name = data.get('room_name')
        user = request.user
        print(f"Utilisateur {user} demande de quitter la salle {room_name}", flush=True)

        room = Room.objects.get(name=room_name)

        if user not in room.users.all():
            print(f"L'utilisateur {user} n'est pas dans la salle {room_name}", flush=True)
            return JsonResponse({'success': False, 'message': 'L\'utilisateur n\'est pas dans cette salle'}, status=400)
        
        room.users.remove(user)
        print(f"Utilisateur {user} retiré de la salle {room_name}", flush=True)

        return JsonResponse({'success': True, 'message': 'Utilisateur retiré de la salle avec succès'})

    except Room.DoesNotExist:
        print(f"Salle {room_name} non trouvée", flush=True)
        return JsonResponse({'success': False, 'message': 'Salle non trouvée'}, status=404)
    except Exception as e:
        print(f"Erreur dans exit_room: {e}", flush=True)
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
def block_user(request, user_id):
    """Bloquer un utilisateur"""
    try:
        blocked_user = User.objects.get(id=user_id)

        if request.user == blocked_user:
            return Response({"error": "Tu ne peux pas te bloquer toi-même."}, status=400)

        BlockedUser.objects.get_or_create(blocker=request.user, blocked=blocked_user)
        return Response({"success": f"{blocked_user.username} a été bloqué."})
    except:
        return Response({"error": "Block user"}, status=404)

@api_view(['DELETE'])
@jwt_auth_required
def unlock_user(request, user_id):
    """Débloquer un utilisateur"""
    try:
        blocked_user = User.objects.get(id=user_id)

        BlockedUser.objects.filter(blocker=request.user, blocked=blocked_user).delete()
        return Response({"success": f"{blocked_user.username} a été débloqué."})
    except:
        return Response({"error": "Unlock user"}, status=404)

@api_view(['GET'])
@jwt_auth_required
def get_list_blocked(request):
    """Lister les utilisateurs bloqués"""
    try:
        blocked_users = BlockedUser.objects.filter(blocker=request.user).values_list("blocked__id", flat=True)
        return Response({"blocked_users": list(blocked_users)})
    except:
        return Response({"error": "List blocked user"}, status=404)