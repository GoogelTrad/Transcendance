import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from users.models import User
from .models import Room, Message, DirectMessage
import jwt
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ValidationError

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from asgiref.sync import database_sync_to_async


class ChatConsumer(AsyncWebsocketConsumer):

    async def getUsers(self):
        token = jwt.decode(self.scope['cookies']['token'], 'coucou', algorithms=['HS256'])
        return await User.objects.aget(id=token['id'])
    
    async def connect(self):
        if not self.scope['cookies']['token']:
            await self.close()
        self.user = await self.getUsers()
        self.room_name = self.scope['url_route']['kwargs']['room']
        self.room = None

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
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data: dict = json.loads(text_data)
        message_type = data['type']
        if message_type == 'send_message':
            await self.sendMessage(data.get('message'))
        elif message_type == 'create_room':
            await self.createRoom(data.get('room_name'), data.get('password'))
        elif message_type == 'join_room':
            await self.joinRoom(data.get('room_name'), data.get('password'))

    async def send(self, data, bytes_data = None, close = False):
        text_data = json.dumps(data)
        await super().send(text_data, bytes_data, close)
        
    
    async def createRoom(self, room_name, password = None):
        if room_name == '' or room_name is None:
            await self.send({
                "type": "create_room",
                "status": False,
                "error": "RoomName is required"
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
            name=room_name,
        )
        await room.asave()

        await room.add_members(self.user)

        await self.send({
            "type": "create_room",
            "status": True,
            "room_name": room.name,
            "message": "Room succesfully created"
        })

    async def deleteRoom(self, room_name):
        pass

    async def joinRoom(self, room_name, password=None):
        try:
            room = await Room.objects.aget(name=room_name)
        except Room.DoesNotExist:
            await self.send({
                "type": "join_room",
                "status": False,
                "error": f"Room '{room_name}' does not exist."
            })
            return

        try:
            room = await Room.objects.aget(name=room_name)
            # Vérifier si un mot de passe est requis
            if room.password and (not password or password != room.password):
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
        if (self.room is None):
            self.room = await Room.objects.aget(name=self.room_name)
        channel_layer = get_channel_layer()
        msg = await Message.objects.acreate(
            user=self.user, 
            room=self.room,
            content=message
        )
        msg.asave()
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


class NotificationConsumer(AsyncWebsocketConsumer):

    async def getUsers(self):
        token = jwt.decode(self.scope['cookies']['token'], 'coucou', algorithms=['HS256'])
        return await User.objects.aget(id=token['id'])
    
    async def connect(self):
        self.user = await self.getUsers()

        if self.user.is_anonymous:
            print("⚠️ Connexion WebSocket refusée : utilisateur anonyme !", flush=True)
            await self.close()
            return

        self.room_group_name = f"user_{self.user.id}"
        print(f"✅ {self.user.username} connecté au WebSocket !", flush=True)

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        print(f"❌ {self.user.username} déconnecté du WebSocket !", flush=True)
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        print("📩 Message reçu :", data, flush=True)

        if data["type"] == "send_notification":
            if "target_id" not in data or "sender_id" not in data:
                print("⚠️ Clé(s) manquante(s) dans send_notification :", data, flush=True)
                return

            target_id = data["target_id"]
            sender_id = data["sender_id"]
            message = data["message"]

            print(f"🔔 Notification envoyée à {target_id}", flush=True)

            await self.channel_layer.group_send(
                f"user_{target_id}",
                {
                    "type": "send_notification",
                    "id": target_id,
                    "message": message,
                    "sender_id": sender_id,
                }
            )

        elif data["type"] == "receive_response":
            if "target_id" not in data or "response" not in data or "sender_id" not in data:
                print("⚠️ Clé(s) manquante(s) dans receive_response :", data, flush=True)
                return

            target_id = data["target_id"]
            response = data["response"]
            sender_id = data["sender_id"]

            print(f"🔄 Réponse reçue : {response} pour la notification {target_id}", flush=True)

            await self.channel_layer.group_send(
                f"user_{sender_id}",
                {
                    "type": "receive_response",
                    "target_id": target_id,
                    "response": response,
                    "sender_id": sender_id,
                }
            )

    async def send_notification(self, event):
        print(f"📤 Envoi de la notification à {self.user.id} :", event, flush=True)

        await self.send(text_data=json.dumps(event))

    async def receive_response(self, event):
        # Lorsque la réponse est reçue, on la renvoie à l'expéditeur

        print("HELLO", flush=True)
        await self.send(text_data=json.dumps({
            "type": "receive_response",
            "sender_id": event["sender_id"],
            "target_id": event["target_id"],
            "response": event["response"],
        }))


class DirectMessageConsumer(AsyncWebsocketConsumer):

    async def getUsers(self):
        token = jwt.decode(self.scope['cookies']['token'], 'coucou', algorithms=['HS256'])
        return await User.objects.aget(id=token['id'])
    
    async def connect(self):
        if not self.scope['cookies']['token']:
            await self.close()
        self.user = await self.getUsers()
        self.room_name = None
        await self.accept()

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['type']
        if message == "invite_user":
            await self.invite_user(data["target_id"])

        elif message == "accept_invite":
            await self.accept_invite(data["room_id"])

        elif message == "send_private_message":
            await self.send_private_message(data["room_id"], data["message"])
    
    async def invite_user(self, target_id):
        """Envoyer une demande d'invitation à un utilisateur"""
        target_user = await self.getUsers(target_id)

        if target_user:
            print(f"👥 Invitation envoyée à {target_user.username}")
            await self.send(text_data=json.dumps({
                "type": "invitation_sent",
                "message": f"Invitation envoyée à {target_user.username}"
            }))

        room, created = await DirectMessage.objects.get_or_create(
            createur=self.user, invite=target_user
        )

        if created:
            await self.channel_layer.group_add(f"user_{target_id}", self.channel_name)
            await self.send(text_data=json.dumps({
                "type": "notification",
                "message": f"{self.user.username} vous invite à un chat privé",
                "room_id": room.id
            }))

    async def accept_invite(self, room_id):
        """Accepter l'invitation et rejoindre le chat"""
        room = await DirectMessage.objects.get(id=room_id)
        room.accepted = True
        await room.save()

        self.room_name = f"chat_{room.id}"
        await self.channel_layer.group_add(self.room_name, self.channel_name)

        await self.send(text_data=json.dumps({
            "type": "chat_started",
            "room_id": room.id
        }))

    async def send_private_message(self, room_id, message):
        """Envoyer un message dans une discussion privee"""
        room = await DirectMessage.objects.get(id=room_id)
        if room.accepted:
            await self.channel_layer.group_send(
                f"chat_{room_id}",
                {
                    "type": "receive_message",
                    "message": message,
                    "sender": self.user.username
                }
            )

    async def receive_message(self, event):
        """Recevoir un message"""
        await self.send(text_data=json.dumps({
            "type": "new_message",
            "message": event["message"],
            "sender": event["sender"]
        }))