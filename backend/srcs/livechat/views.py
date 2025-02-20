from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Room
from .serializer import RoomSerializer, UserConnectedSerializer
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
    for room in rooms:
        room.users.all()
    dmRooms = rooms.filter(dm=True)
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
        return Response(users_data, status=200)
    except:
        return Response({"error": "Room introuvable."}, status=404)

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

@api_view(['GET'])
def get_users_connected(request):
    try:
        users = User.objects.all()
        serializer = UserConnectedSerializer(users, many=True)
        return Response(serializer.data)
    except:
        return Response({"error": "Users connected not found."}, status=404)
    
# @api_view(["POST"])
# def invite_user(request):
#     room_name = request.data.get("room_name")
#     user_id = request.data.get("user_id")

#     room = get_object_or_404(Room, name=room_name)
#     user = get_object_or_404(User, id=user_id)

#     if room.invitation_required:
#         room.invited_users.add(user)
#         return Response({"message": f"{user.username} a été invité à la room {room.name}"})

#     return Response({"error": "Cette salle ne nécessite pas d'invitation."}, status=400)