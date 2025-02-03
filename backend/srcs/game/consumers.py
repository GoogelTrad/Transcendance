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
        if "pongData" in data_dict:
            pong = data_dict.get("pongData", {})
            new_velocity_y = pong.get("velocity_y")
            new_velocity_x = pong.get("velocity_x")
            old_pos_y = pong.get("pos_y")
            old_pos_x = pong.get("pos_x")
            canvas_height = data_dict.get("height_to_send")
            canvas_width = data_dict.get("width_to_send")
            paddle_data = data_dict.get("paddleData")
            rightY = paddle_data.get("rightY")
            leftY = paddle_data.get("leftY")
            paddle_width = paddle_data.get("width")
            paddle_height = paddle_data.get("height")
            paddleLeftX = data_dict.get("paddleLeftX")
            paddleRightX = data_dict.get("paddleRightX")
            if old_pos_y >= canvas_height :
                new_velocity_y = new_velocity_y * -1
            if old_pos_y <= 0 :
                new_velocity_y = new_velocity_y * -1
            if old_pos_x <= paddleLeftX + paddle_width and old_pos_y >= leftY and old_pos_y <= leftY + paddle_height :
                new_velocity_x = new_velocity_x * -1
            if old_pos_x >= paddleRightX and old_pos_y >= rightY and old_pos_y <= rightY + paddle_height :
                new_velocity_x = new_velocity_x * -1
            if old_pos_x <= 0 :
                await self.send(text_data=json.dumps({
                'new_pos_x': canvas_width / 2,
                'new_pos_y': canvas_height / 2,
                'new_velocity_x' : 4,
                'new_velocity_y' : 4,
                'score' : 1,
            }))
                return
            if old_pos_x >= canvas_width :
                await self.send(text_data=json.dumps({
                'new_pos_x': canvas_width / 2,
                'new_pos_y': canvas_height / 2,
                'new_velocity_x' : 4,
                'new_velocity_y' : 4,
                'score' : 1,
            }))
                return
            new_pos_x = old_pos_x + new_velocity_x
            new_pos_y = old_pos_y + new_velocity_y
            await self.send(text_data=json.dumps({
                'new_pos_x': new_pos_x,
                'new_pos_y': new_pos_y,
                'new_velocity_x' : new_velocity_x,
                'new_velocity_y' : new_velocity_y,
            }))
        elif "paddleData" in data_dict :
            keyPress = data_dict.get("isKeyDown")
            paddle_data = data_dict.get("paddleData")
            rightY = paddle_data.get("rightY")
            leftY = paddle_data.get("leftY")
            height = paddle_data.get("height_canvas")
            is_key_down = data_dict['isKeyDown']

            for key, is_pressed in is_key_down.items():
                if is_pressed:
                    if key == "ArrowDown":
                        rightY = min(height - 100, rightY + 10)
                    elif key == "ArrowUp":
                        rightY = max(0, rightY - 10)
                    elif key == "z":
                        leftY = max(0, leftY - 10)
                    elif key == "s":
                        leftY = min(height - 100, leftY + 10)
                        
            await self.send(text_data=json.dumps({
                'player1_paddle_y': rightY,
                'player2_paddle_y': leftY,
            }))
        