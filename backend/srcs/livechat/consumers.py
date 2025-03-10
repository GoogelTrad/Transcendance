import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from users.models import User
from .models import Room, Message
from .serializer import MessageSerializer
import jwt
import os
from django.core.exceptions import ValidationError
from channels.db import database_sync_to_async
from game.models import Game


from asgiref.sync import sync_to_async
import re

@sync_to_async
def get_user_by_name(username):
    return User.objects.filter(name=username).first()

@sync_to_async
def is_user_blocked(from_user, to_user):
    return from_user.blocked_user.filter(id=to_user.id).exists()
@sync_to_async
def get_room_messages(room_name, user):
    try:
        room = Room.objects.get(name=room_name)
        messages = Message.objects.filter(room=room).order_by('timestamp')

        filtered_user = user.blocked_user.values_list('id', flat=True)
        filtered_messages = [msg for msg in messages if msg.user.id not in filtered_user]

        for msg in messages:
            if not isinstance(msg.user, User):
                print(f"Message {msg.id} has invalid user: {msg.user}", flush=True)
        serializer = MessageSerializer(filtered_messages, many=True)

        return serializer.data
    except Room.DoesNotExist:
        pass

class ChatConsumer(AsyncWebsocketConsumer):
    
    room_user_ids = []

    async def getUsers(self):
        try:
            token = self.scope['cookies'].get('token', None)
            if not token:
                return None

            decoded_token = jwt.decode(token, os.getenv('JWT_KEY'), algorithms=['HS256'])
            user_id = decoded_token.get('id')

            if not user_id:
                return None

            user = await User.objects.aget(id=user_id)
            return user

        except User.DoesNotExist:
            return None
        except Exception as e:
            return None

    async def connect(self):
        if not self.scope['cookies'].get('token', None):
            await self.close()
            return
        self.user = await self.getUsers()
        if not self.user:
            await self.close()
            return
        self.room_name = self.scope['url_route']['kwargs']['room']

        if not re.match(r'^[0-9a-zA-Z]+$', self.room_name):
            await self.accept()
            await self.send({
                "type": "error",
                "error": f"Invalid room name: {self.room_name}. Use only alphanumeric characters."
            })
            await self.close()
            return

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

        messages = await get_room_messages(self.room_name, self.user)
        await self.send({
            'type': 'history',
            'messages': messages
        })
        
    async def disconnect(self, close_code):

        channel_layer = get_channel_layer()
        if hasattr(self, 'room_group_name'):
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
            await self.createRoom(data.get('room_name'), data.get('invited_user_id'))
        elif message_type == 'join_room':
            await self.joinRoom(data.get('room_name'), data.get('dmname'))

    async def send(self, data, bytes_data = None, close = False):
        text_data = json.dumps(data)
        await super().send(text_data, bytes_data, close)

    @sync_to_async
    def checkIfDmRoomExist(self, invited_id):
        if invited_id == None:
            return []
        invited_user: User = User.objects.get(id=invited_id)

        room = Room.objects.filter(createur=self.user, dm=True)
        result = room.filter(users=invited_user)

        if not result:
            room = Room.objects.filter(createur=invited_user, dm=True)
            result = room.filter(users=self.user)

        return list(result)

    
    async def createRoom(self, room_name, invited_user_id = None):
        if not room_name:
            await self.send({
                "type": "error",
                "status": False,
                "error": "RoomName is required"
            })
            return
        
        try:
            room: Room = await Room.objects.aget(name=room_name)
            print("HEYYYY", flush=True)
            await self.send({
                "type": "error",
                "status": False,
                "error": f"{room_name} already exist"
            })
            return
        except Room.DoesNotExist:
            pass
        dmRoom = await self.checkIfDmRoomExist(invited_user_id)
        if dmRoom:
            await self.send({
                "type": "error",
                "status": True,
                "room_name": dmRoom[0].name,
                "error": f"already exist"
            })
            return

        room = Room(
            createur=self.user,
            name=room_name,
            dm=True if invited_user_id is not None else False
        )

        try:
            await sync_to_async(room.full_clean)()
            await room.asave()
        except ValidationError as e:
            await self.send({
                "type": "error",
                "status": False,
                "error": "Room name invalid, must be 15 characters max and letters only"
            })
            return
        
        await room.add_members(self.user)
        if invited_user_id is not None:
            invited_user: User = await User.objects.aget(id=invited_user_id)
            await room.add_members(invited_user)

        await self.send({
            "type": "create_room",
            "status": True,
            "room_name": room.name,
            "message": "Room succesfully created"
        })

    async def deleteRoom(self, room_name):
        pass

    async def joinRoom(self, room_name, dmname=None):
        try:
            room = await Room.objects.aget(name=room_name)
        except Room.DoesNotExist:
            await self.send({
                "type": "error",
                "status": False,
                "error": f"Room '{room_name}' does not exist."
            })
            return
        
        if room.dm:
            room_users = await sync_to_async(list)(room.users.all())
            if self.user not in room_users:
                await self.send({
                    "type": "error",
                    "status": False,
                    "error": "You are not authorized to join this DM."
                })
                return

        await room.add_members(self.user)
        self.room = room
        self.name = room_name
        self.room_group_name = f"chat_{self.name}"

        channel_layer = get_channel_layer()
        await channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.send({
            "type": "join_room",
            "status": True,
            "room_name": room.name,
            "dmname": dmname,
            "message": f"You have successfully joined the room '{room.name}'."
        })

        messages = await get_room_messages(self.room_name, self.user)
        await self.send({
            'type': 'history',
            'messages': messages
        })
            
    async def sendMessage(self, message):
        if self.room is None:
            self.room = await Room.objects.aget(name=self.room_name)

        if len(message) > 300:
            await self.send({
                'type': 'error',
                'message': "You can not write more than 300 characters."
            })
            return

        if len(message) == 0:
            await self.send({
                'type': 'error',
                'message': "You can not send a blank message."
            })
            return 

        msg = await Message.objects.acreate(
            user=self.user, 
            room=self.room,
            content=message
        )

        await msg.asave()

        channel_layer = get_channel_layer()
        await channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'username': self.user.name,
                'timestamp': msg.timestamp.isoformat()
            }
        )

    async def chat_message(self, event):
        message = event['message']
        username = event['username']
        timestamp = event['timestamp']

        to_user = await get_user_by_name(username)
        from_user = await get_user_by_name(self.user.name)

        if not await is_user_blocked(from_user, to_user):
            await self.send({
                'type': 'chat_message',
                'message': message,
                'username': username,
                'timestamp': timestamp
            })


class NotificationConsumer(AsyncWebsocketConsumer):
    groups = []

    def __init__(self):
        self.room_group_name = None

    async def getUsers(self):
        token = jwt.decode(self.scope['cookies']['token'], os.getenv('JWT_KEY'), algorithms=['HS256'])
        return await User.objects.aget(id=token['id'])
    
    async def connect(self):
        if not self.scope['cookies'].get('token'):
            await self.close()
            return
    
        self.user = await self.getUsers()
        if not self.user:
            await self.close()
            return

        if self.user.is_anonymous:
            await self.close()
            return

        self.room_group_name = f"user_{self.user.id}"
        channel_layer = get_channel_layer()
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        channel_layer = get_channel_layer()
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)

        if data["type"] == "send_notification":
            if "target_id" not in data or "sender_id" not in data:
                return
            target_id = data["target_id"]
            sender_id = data["sender_id"]
            message = data["message"]
            room_name = data["room_name"]
            channel_layer = get_channel_layer()
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

        elif data["type"] == "send_invite":
            if "target_id" not in data or "sender_id" not in data:
                return
            target_id = data["target_id"]
            sender_id = data["sender_id"]
            message = data["message"]
            channel_layer = get_channel_layer()
            await self.channel_layer.group_send(
                f"user_{target_id}",
                {
                    "type": "send_invite",
                    "id": target_id,
                    "message": message,
                    "sender_id": sender_id,
                }
            )

        elif data["type"] == "receive_response":
            if "target_id" not in data or "response" not in data or "sender_id" not in data:
                return
            target_id = data["target_id"]
            response = data["response"]
            sender_id = data["sender_id"]
            channel_layer = get_channel_layer()
            await self.channel_layer.group_send(
                f"user_{sender_id}",
                {
                    "type": "receive_response",
                    "target_id": target_id,
                    "response": response,
                    "sender_id": sender_id,
                }
            )
            if response == "accept":
                game_data = await self.create_Game_Multi(sender_id, target_id)
                if game_data:
                    await self.start_game(game_data['id'], sender_id, target_id)
                    channel_layer = get_channel_layer()
                    await self.channel_layer.group_send(
                        f"user_{sender_id}",
                        {
                            "type": "game_created", 
                            "game_id": game_data['id'],
                            "player1": game_data['player1'],
                            "player2": game_data['player2'],
                            "message": "Game started!"
                        }
                    )
                    await self.channel_layer.group_send(
                        f"user_{target_id}",
                        {
                            "type": "game_created",
                            "game_id": game_data['id'],
                            "player1": game_data['player1'],
                            "player2": game_data['player2'],
                            "message": "Game started!"
                        }
                    )

    async def send_notification(self, event):
        await self.send(text_data=json.dumps(event))

    async def send_invite(self, event):
        await self.send(text_data=json.dumps(event))

    async def receive_response(self, event):
        await self.send(text_data=json.dumps({
            "type": "receive_response",
            "sender_id": event["sender_id"],
            "target_id": event["target_id"],
            "response": event["response"],
        }))

    @database_sync_to_async
    def create_game_directly(self, player1, player2):
        try:
            p1 = User.objects.filter(id=player1).first()
            p2 = User.objects.filter(id=player2).first()
            game = Game.objects.create(
                player1=p1.name,
                player2=p2.name,
            )
            p1.games.add(game)
            p2.games.add(game)
            p1.save()
            p2.save()
            return {
                'id': game.id,
                'player1': game.player1,
                'player2': game.player2,
            }
        except Exception as e:
            return None

    async def create_Game_Multi(self, player1, player2):
        game_data = await self.create_game_directly(player1, player2)
        if game_data:
            return game_data
        else:
            return None

    async def game_update(self, event):
        await self.send(text_data=json.dumps(event))

    async def game_created(self, event):
        await self.send(text_data=json.dumps({
            "type": "game_created",
            "game_id": event["game_id"],
            "player1": event["player1"],
            "player2": event["player2"],
            "message": event["message"],
        }))

    async def start_game(self, game_id, player1_id, player2_id):
        channel_layer = get_channel_layer()
        player1_channel = f"user_{player1_id}"
        player2_channel = f"user_{player2_id}"
        
        await self.channel_layer.group_send(
            player1_channel,
            {
                "type": "game_update",
                "game_id": game_id,
            }
        )
        await self.channel_layer.group_send(
            player2_channel,
            {
                "type": "game_update",
                "game_id": game_id,
            }
        )
        group_name = f"game_{game_id}"
        await self.channel_layer.group_add(group_name, player1_channel)
        await self.channel_layer.group_add(group_name, player2_channel)