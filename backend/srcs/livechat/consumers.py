import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from users.models import User
from .models import Room, Message
import jwt
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ValidationError

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

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
        self.room = None
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
            name=room_name
        )
        await room.asave()

        # Ajouter le créateur comme premier membre
        # await self.room.add_members(self.user)
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
        # if room_name == '' or room_name is None:
        #     await self.send({
        #         "type": "join_room",
        #         "status": False,
        #         "error": "roomName is required"
        #     })
        #     return

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


# class NotificationConsumer(AsyncWebsocketConsumer):

#     async def getUsers(self):
#         token = jwt.decode(self.scope['cookies']['token'], 'coucou', algorithms=['HS256'])
#         return await User.objects.aget(id=token['id'])
    
#     async def connect(self):
#         self.user = await self.getUsers()
#         self.room_group_name = f"notifications_{self.user.id}"

#          # Ajoute un log lors de la connexion
#         print(f"✅ {self.user} connecté au WebSocket !", flush=True)


#         await self.channel_layer.group_add(self.room_group_name, self.channel_name)
#         await self.accept()

#     async def disconnect(self, close_code):
#         print(f"❌ {self.user} déconnecté du WebSocket !", flush=True)
#         await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

#     # async def receive_json(self, content):
#     #     message_type = content.get("type")

#     #     if message_type == "send_notification":
#     #         target_id = content.get("target_id")
#     #         sender_id = content.get("sender_id")  # L'expéditeur
#     #         message = content.get("message")

#     #         await self.channel_layer.group_send(
#     #             f"notifications_{target_id}",
#     #             {
#     #                 "type": "send_notification",
#     #                 "message": message,
#     #                 "sender_id": sender_id  # On envoie aussi l’expéditeur au destinataire
#     #             }
#     #         )

#     #     elif message_type == "respond_notification":
#     #         notification_id = content.get("notification_id")
#     #         response = content.get("response")
#     #         sender_id = content.get("sender_id")  # Récupérer l'expéditeur

#     #         # Envoyer la réponse à l'expéditeur
#     #         await self.channel_layer.group_send(
#     #             f"notifications_{sender_id}",
#     #             {
#     #                 "type": "receive_response",
#     #                 "response": response,
#     #                 "notification_id": notification_id
#     #             }
#     #         )
        
#     async def receive(self, text_data):
#         data = json.loads(text_data)
#         print(f"📩 Message reçu : {data}")  # Log pour voir si Django reçoit le message

#         if data["type"] == "send_notification":
#             print(f"🔔 Notification envoyée à {data['target_id']}")
#             await self.channel_layer.group_send(
#                 f"user_{data['target_id']}",
#                 {
#                     "type": "send_notification",
#                     "message": data["message"],
#                     "sender_id": data["sender_id"],
#                 }
#             )

#     # async def send_notification(self, event):
#     #     print("SEND_NOTIFICATION!!!", flush=True)
#     #     await self.send_json({
#     #         "type": "send_notification",
#     #         "message": event["message"],
#     #         "sender_id": event["sender_id"]
#     #     })
            
#     # async def send_invitation(self, event):
#     #     message = event["message"]
#     #     sender_id = event["sender_id"]
#     #     target_id = event["target_id"]

#     #     print(f"📨 Envoi de l'invitation à {target_id} : {message}", flush=True)  # Ajoute ce log

#     #     await self.send(text_data=json.dumps({
#     #         "type": "send_notification",
#     #         "message": message,
#     #         "sender_id": sender_id,
#     #     }))
            
#     async def send_notification(self, event):
#         print(f"📤 Envoi de la notification à l'utilisateur {event['sender_id']}")
#         await self.send(text_data=json.dumps(event))

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

    # async def receive(self, text_data):
    #     data = json.loads(text_data)
    #     print("📩 Message reçu :", data, flush=True)

    #     if data["type"] == "send_notification":
    #         target_id = data["target_id"]
    #         sender_id = data["sender_id"]
    #         message = data["message"]

    #         print(f"🔔 Notification envoyée à {target_id}", flush=True)

    #         await self.channel_layer.group_send(
    #             f"user_{target_id}",
    #             {
    #                 "type": "send_notification",
    #                 "id": target_id,
    #                 "message": message,
    #                 "sender_id": sender_id,
    #             }
    #         )
    #     elif data["type"] == "receive_response":
    #         if "target_id" not in data:
    #             print("⚠️ 'target_id' manquant dans la réponse.", flush=True)
    #             return

    #         target_id = data["target_id"]
    #         response = data["response"]
    #         sender_id = data["sender_id"]

    #         print(f"🔄 Réponse reçue : {response} pour la notification {target_id}", flush=True)

    #         await self.channel_layer.group_send(
    #             f"user_{sender_id}",
    #             {
    #                 "type": "receive_response",
    #                 "target_id": target_id,
    #                 "response": response,
    #             }
    #         )

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
