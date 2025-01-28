from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Room
from .serializer import RoomSerializer
from django.http import JsonResponse

@api_view(['GET'])
def get_list_rooms(request):
    rooms = Room.objects.all()
    serializer = RoomSerializer(rooms, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_list_users(request, name):
    try:
        room = Room.objects.get(name=name)
        users = room.users.all()
        users_data = [{"id": user.id,"username": user.name} for user in users]
        return Response(users_data, status=200)
    except:
        return Response({"error": "Room introuvable."}, status=404)