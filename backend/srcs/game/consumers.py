from channels.db import database_sync_to_async
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Game
class gameConsumer(AsyncWebsocketConsumer):

    @database_sync_to_async
    def get_game(self):
        try:
            return Game.objects.first()
        except Exception as e:
            print(f"Error fetching game: {e}")
            return None

    @database_sync_to_async
    def save_game(self, game):
        try:
            game.save()
        except Exception as e:
            print(f"Error saving game: {e}")

    async def connect(self):
        print("WebSocket connected!")
        await self.accept()

    async def disconnect(self, close_code):
        print(f"WebSocket disconnected with close code: {close_code}")

    async def receive(self, text_data):

        try:
            data_dict = json.loads(text_data)
        except json.JSONDecodeError:
            print("Error decoding JSON data")
            return
        game = await self.get_game()
        keyPress = data_dict.get("isKeyDown")
        paddle_data = data_dict.get("paddleData")
        print(keyPress, flush=True)
        print(paddle_data.items(), flush=True)
        rightY = paddle_data.get("rightY")
        leftY = paddle_data.get("leftY")
        is_key_down = data_dict['isKeyDown']

        for key, is_pressed in is_key_down.items():
            if is_pressed:
                print(f"Key {key} is pressed")
                if key == "ArrowDown":
                    print(f"cc1")
                    rightY += 1
                elif key == "ArrowUp":
                    print(f"cc2")
                    rightY -= 1
                elif key == "s":
                    print(f"cc3")
                    leftY += 1
                elif key == "z":
                    print(f"cc4")
                    leftY -= 1
                    
        await self.send(text_data=json.dumps({
            'player1_paddle_y': rightY,
            'player2_paddle_y': leftY,
        }))
        
