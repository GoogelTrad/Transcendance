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

    async def receive(self, text_data=None, bytes_data=None, **kwargs):

        game = await self.get_game()

        if game is None:
            print("No game found!")
            return

        if text_data == "paddle_down":
            game.player1_paddle_y += 1
        elif text_data == "paddle_up":
            game.player1_paddle_y -= 1

        await self.save_game(game)

        await self.send(text_data=json.dumps({
            'player1_paddle_y': game.player1_paddle_y,
        }))
