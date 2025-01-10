import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from users.models import User
import jwt
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import Room
from django.core.exceptions import ValidationError

class ChatConsumer(AsyncWebsocketConsumer):

    async def getUsers(self):
        token = jwt.decode(self.scope['cookies']['token'], 'coucou', algorithms=['HS256'])
        return await User.objects.aget(id=token['id'])

    async def connect(self):
        # print(self.scope, flush=True)  # Déboguer les données de connexion
        # print(self.scope['cookies'], flush=True)
        if not self.scope['cookies']['token']:
            await self.close()
        self.user = await self.getUsers()
        self.room_name = self.scope['url_route']['kwargs']['room']
        # get room from database
        # check if room is private or protected by password
        # if condition is true accept connection else not

        self.room_group_name = f"chat_{self.room_name}"

        channel_layer = get_channel_layer()
        await channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()


    async def disconnect(self, close_code):
        # Leave the chat room group
        channel_layer = get_channel_layer()
        await channel_layer.group_discard(
            self.room_group_name,  # The group to leave
            self.channel_name  # The connection to remove from the group
        )

    async def receive(self, text_data):
        data: dict = json.loads(text_data)
        message_type = data['type']
        if message_type == 'send_message':
            # Envoyer le message au groupe
            await self.sendMessage(data.get('message'))
        elif message_type == 'create_room':
            await self.createRoom(data.get('room_name'), data.get('password'), data.get('limit'))
        elif message_type == 'join_room':
            await self.joinRoom(data.get('room_name'), data.get('password'))

    async def send(self, data, bytes_data = None, close = False):
        text_data = json.dumps(data)
        await super().send(text_data, bytes_data, close)
        
    
    async def createRoom(self, room_name, password = None, limit = None):
        if room_name == '' or room_name is None:
            await self.send({
                "type": "create_room",
                "status": False,
                "error": "roomName is required"
            })
        try:
            room: Room = await Room.objects.aget(name=room_name)
            await self.send({
                "type": "create_room",
                "status": False,
                "error": f"{room_name} already exist"
            })
            return
        except Room.DoesNotExist:
            pass
        room = await Room.objects.acreate(
            createur=self.user,
            password=password,
            name=room_name
        )

        # Ajouter le créateur comme premier membre
        await room.add_members(self.user)
        # create room, add room to db and link to user
        await self.send({
            "type": "create_room",
            "status": True,
            "room_name": room.name,
            "message": "Room succesfully created"
        })

    async def deleteRoom(self, room_name):
        pass

    async def joinRoom(self, room_name, password=None):
        if room_name == '' or room_name is None:
            await self.send({
                "type": "join_room",
                "status": False,
                "error": "roomName is required"
            })
            return

        try:
            room = await Room.objects.aget(name=room_name)

            # Vérifier si un mot de passe est requis
            if room.password:
                if not password or password != room.password:
                    await self.send({
                        "type": "join_room",
                        "status": False,
                        "error": "Invalid password"
                    })
                    return

            await room.add_members(self.user)

            await self.send({
                "type": "join_room",
                "status": True,
                "room_name": room.name,
                "message": f"You have successfully joined the room '{room.name}'."
            })

        except Room.DoesNotExist:
            await self.send({
                "type": "join_room",
                "status": False,
                "error": f"Room '{room_name}' does not exist."
            })

    
    async def sendMessage(self, message):
        channel_layer = get_channel_layer()
        await channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'username': self.user.name,
            }
        )
        print(f"User: {self.user}, Authenticated: {self.user.is_authenticated}", flush=True)

    # Receive message from group (broadcast from the server)
    async def chat_message(self, event):
        message = event['message']
        username = event['username']
        ev = event['type']

        print(event, flush=True)

        # Send message to WebSocket
        await self.send({
            'type': ev,
            'message': message,
            'username': username,
        })

        print()
