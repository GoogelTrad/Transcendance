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
def get_list_users():
    users = Room.users.all()
    return users