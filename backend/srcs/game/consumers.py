import json
from channels.generic.websocket import AsyncWebsocketConsumer

class gameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
    async def disconnect(self, close_code):
        print(f"WebSocket disconnected with close code: {close_code}")
    async def receive(self, text_data=None, bytes_data=None, **kwargs):
        await self.send(text_data)
