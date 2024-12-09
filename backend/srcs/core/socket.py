import json

from channels.generic.websocket import AsyncWebsocketConsumer

class SocketConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Appelé lorsque le client WebSocket se connecte
        await self.accept()
        await self.send(json.dumps({"message": "Connexion établie"}))

    async def disconnect(self, close_code):
        # Appelé lorsque le client WebSocket se déconnecte
        pass

    async def receive(self, text_data):
        # Appelé lorsqu'un message est reçu du client WebSocket
        data = json.loads(text_data)
        message = data.get('message', '')
        await self.send(json.dumps({"message": f"Reçu : {message}"}))
        

def handler(request, *callback_args, **callback_kwargs):
    raise Exception("coucou")

# sio = socketio.Server(cors_allowed_origins='*')

# @sio.on('connect')
# def connect(sid, environ):
#     print('Client connected')

# @sio.on('disconnect')
# def disconnect(sid):
#     print('Client disconnected')

# @sio.on('message')
# def message(sid, data):
#     print(f'Received message: {data}')
#     sio.emit('response', f'Response from server')
