# import json

# from asgiref.sync import async_to_sync
# from channels.generic.websocket import WebsocketConsumer


# class ChatConsumer(WebsocketConsumer):
#     def connect(self):
#         self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
#         self.room_group_name = f"chat_{self.room_name}"

#         # Join room group
#         async_to_sync(self.channel_layer.group_add)(
#             self.room_group_name, self.channel_name
#         )

#         self.accept()

#     def disconnect(self, close_code):
#         # Leave room group
#         async_to_sync(self.channel_layer.group_discard)(
#             self.room_group_name, self.channel_name
#         )

#     # Receive message from WebSocket
#     def receive(self, text_data):
#         text_data_json = json.loads(text_data)
#         message = text_data_json["message"]

#         # Send message to room group
#         async_to_sync(self.channel_layer.group_send)(
#             self.room_group_name, {"type": "chat.message", "message": message}
#         )

#     # Receive message from room group
#     def chat_message(self, event):
#         message = event["message"]

#         # Send message to WebSocket
#         self.send(text_data=json.dumps({"message": message}))


#------------------------------------------------------------------------------#


# EXENPLE DE COMMUNICATION 
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get the room name (or any other group name, unique per connection)
        self.room_name = "public"  # You can dynamically set this based on the URL, user, etc.
        self.room_group_name = f"chat_{self.room_name}"

        # Join the chat room group
        channel_layer = get_channel_layer()
        await channel_layer.group_add(
            self.room_group_name,  # The name of the group (used for broadcasting)
            self.channel_name  # The name of the individual WebSocket connection
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave the chat room group
        channel_layer = get_channel_layer()
        await channel_layer.group_discard(
            self.room_group_name,  # The group to leave
            self.channel_name  # The connection to remove from the group
        )

    # Receive message from WebSocket (client sends data)
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        print(text_data_json, flush=True)
        message = text_data_json['message']

        # Send message to the group
        channel_layer = get_channel_layer()
        await channel_layer.group_send(
            self.room_group_name,  # The group to send the message to
            {
                'type': 'chat_message',  # The type of message to be sent
                'message': message,  # The message content
            }
        )

    # Receive message from group (broadcast from the server)
    async def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))


#----------------------------------TEST---------------------------------------------#

# import json
# from channels.generic.websocket import AsyncWebsocketConsumer
# from .models import Message

# class ChatConsumer(AsyncWebsocketConsumer):
# 	async def connect(self):
# 		self.room_name = self.scope['url_route']['kwargs']['room_name']
# 		self.room_group_name = f'chat_{self.room_name}'

# 		# Joindre le groupe de la salle
# 		await self.channel_layer.group_add(
# 			self.room_group_name,
# 			self.channel_name
# 		)
# 		await self.accept()

# 	async def disconnect(self, close_code):
# 		# Quitter le groupe de la salle
# 		await self.channel_layer.group_discard(
# 			self.room_group_name,
# 			self.channel_name
# 		)

# 	# Recevoir un message d'un WebSocket
# 	async def receive(self, text_data):
# 		data = json.loads(text_data)
# 		message = data['message']
# 		username = self.scope['user'].username  # Récupérer le nom d'utilisateur

# 		# Enregistrer le message dans la base de données
# 		await self.save_message(username, message)

# 		# Envoyer le message au groupe
# 		await self.channel_layer.group_send(
# 			self.room_group_name,
# 			{
# 				'type': 'chat_message',
# 				'message': message,
# 				'username': username,
# 			}
# 		)

# 	async def chat_message(self, event):
# 		# Envoyer le message au WebSocket
# 		await self.send(text_data=json.dumps({
# 			'message': event['message'],
# 			'username': event['username'],
# 		}))

# 	@staticmethod
# 	async def save_message(username, message):
# 		Message.objects.create(username=username, content=message)
