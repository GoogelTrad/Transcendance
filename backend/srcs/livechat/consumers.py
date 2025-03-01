import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from users.models import User
from .models import Room, Message
import jwt
import os
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ValidationError

from asgiref.sync import sync_to_async

@sync_to_async
def get_user_by_name(username):
    return User.objects.filter(name=username).first()

@sync_to_async
def is_user_blocked(from_user, to_user):
    print("ALED = ", flush=True)
    return from_user.blocked_user.filter(id=to_user.id).exists()

class ChatConsumer(AsyncWebsocketConsumer):
    
    room_user_ids = []

    async def getUsers(self):
        try:
            token = self.scope['cookies'].get('token', None)
            if not token:
                print("⚠️ Aucun token trouvé !")
                return None

            # print(f"📢 Token reçu : {token}")

            decoded_token = jwt.decode(token, os.getenv('JWT_KEY'), algorithms=['HS256'])
            # print(f"📢 Token décodé : {decoded_token}")

            user_id = decoded_token.get('id')
            if not user_id:
                print("⚠️ Aucun ID utilisateur dans le token !")
                return None

            user = await User.objects.aget(id=user_id)
            # print(f"✅ Utilisateur récupéré : {user}")

            return user
        except User.DoesNotExist:
            print("❌ Erreur : Utilisateur introuvable !")
            return None
        except Exception as e:
            print(f"❌ Erreur d'authentification : {e}")
            return None

    async def connect(self):
        print("passe", flush=True)
        if not self.scope['cookies']['token']:
            print("not auth", flush=True)
            await self.close()
            return
        self.user = await self.getUsers()
        if not self.user:  # Vérifie si l'utilisateur est valide
            print("user none", flush=True)
            await self.close()
            return
        self.room_name = self.scope['url_route']['kwargs']['room']
        self.room = None
        if not self.room_user_ids.__contains__(self.user.id):
            self.room_user_ids.append(self.user.id)

        self.room_group_name = f"chat_{self.room_name}"
        channel_layer = get_channel_layer()
        await channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        
    async def disconnect(self, close_code):
        print(f"❌ {self.user.username} déconnecté du WebSocket ! {close_code}", flush=True)
        # Leave the chat room group
        channel_layer = get_channel_layer()
        if hasattr(self, 'room_group_name'):  # Vérifie si l'attribut existe
            await channel_layer.group_discard(
                self.room_group_name,  # Ajout du nom du groupe
                self.channel_name
            )

    async def receive(self, text_data):
        data: dict = json.loads(text_data)
        message_type = data['type']
        if message_type == 'send_message':
            await self.sendMessage(data.get('message'))
        elif message_type == 'create_room':
            await self.createRoom(data.get('room_name'), data.get('password'), data.get('invited_user_id'))
        elif message_type == 'join_room':
            await self.joinRoom(data.get('room_name'), data.get('password'))

    async def send(self, data, bytes_data = None, close = False):
        text_data = json.dumps(data)
        await super().send(text_data, bytes_data, close)
    
    async def createRoom(self, room_name, password = None, invited_user_id = None):
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
            dm=True if invited_user_id is not None else False
        )
        
        await room.add_members(self.user)
        if invited_user_id is not None:
            invited_user: User = await User.objects.aget(id=invited_user_id)
            await room.add_members(invited_user)

        await room.asave()

        await self.send({
            "type": "create_room",
            "status": True,
            "room_name": room.name,
            "message": "Room succesfully created"
        })

    async def deleteRoom(self, room_name):
        pass

    async def joinRoom(self, room_name, password=None, dmname=None):
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

        msg = await Message.objects.acreate(
            user=self.user, 
            room=self.room,
            content=message
        )

        await msg.asave()

        # Vérifier si l'utilisateur est bloqué avant d'envoyer le message
        channel_layer = get_channel_layer()
        # print(self.scope, flush=True)
        await channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'username': self.user.name,
            }
        )

    # Receive message from group (broadcast from the server)
    async def chat_message(self, event):
        message = event['message']
        username = event['username']
        print(self.user.id, self.user.name, username, flush=True)

        # Vérifier si l'utilisateur a bloqué l'expéditeur
        to_user = await get_user_by_name(username)
        from_user = await get_user_by_name(self.user.name)

        if not await is_user_blocked(from_user, to_user):
            print('coucou', flush=True)
            await self.send({
                'type': 'chat_message',
                'message': message,
                'username': username,
            })


class NotificationConsumer(AsyncWebsocketConsumer):
    async def getUsers(self):
        token = jwt.decode(self.scope['cookies']['token'], os.getenv('JWT_KEY'), algorithms=['HS256'])
        return await User.objects.aget(id=token['id'])
    
    async def connect(self):
        if not self.scope['cookies'].get('token'):  # Vérifie si le token existe
            await self.close()
            return
    
        self.user = await self.getUsers()

        if not self.user:  # Vérifie si l'utilisateur est valide
            await self.close()
            return

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
        print(f"❌ {self.user.username} déconnecté du WebSocket ! {close_code}", flush=True)
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
            room_name = data["room_name"]

            print(f"ROOM_NAME: {room_name}", flush=True)

            print(f"🔔 Notification envoyée à {target_id}", flush=True)

            await self.channel_layer.group_send(
                f"user_{target_id}",
                {
                    "type": "send_notification",
                    "id": target_id,
                    "message": message,
                    "sender_id": sender_id,
                    "room_name": room_name
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
