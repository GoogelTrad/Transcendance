from channels.db import database_sync_to_async
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Game
import random
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
        if "timer" in data_dict:
            time = data_dict.get("timer")
            seconds = time.get("seconds")
            minutes = time.get("minutes")
            if seconds == 0:
                await self.send(text_data=json.dumps({
                'seconds': 59,
                'minutes': minutes - 1,
            }))
                return
            else :
                await self.send(text_data=json.dumps({
                'seconds': seconds - 1,
                'minutes': minutes,
            }))
                return
        if "pongData" in data_dict:
            pong = data_dict.get("pongData")
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
            score = data_dict.get("score")
            score_P1 = score.get("score_P1")
            score_P2 = score.get("score_P2")
            new_pos_x = old_pos_x + new_velocity_x
            new_pos_y = old_pos_y + new_velocity_y
            if new_pos_y >= canvas_height :
                new_velocity_y = new_velocity_y * -1
            if new_pos_y <= 0 :
                new_velocity_y = new_velocity_y * -1
            if new_pos_x > paddleLeftX and new_pos_x <= paddleLeftX + paddle_width and new_pos_y >= leftY and new_pos_y <= leftY + paddle_height:
                new_velocity_x = -new_velocity_x
                if new_velocity_x < 20:
                    new_velocity_x *= 1.1
                # if new_pos_y <= leftY + paddle_height / 2:
                #     new_velocity_y = 0
                # if new_pos_y > leftY + paddle_height / 2:
                #     new_velocity_y = 20
            if new_pos_x < paddleRightX + paddle_width and new_pos_x >= paddleRightX and new_pos_y >= rightY and new_pos_y <= rightY + paddle_height:
                new_velocity_x = -new_velocity_x
                if new_velocity_x > -20 :
                    new_velocity_x *= 1.1
                # if new_pos_y <= rightY + paddle_height / 2:
                #     new_velocity_y = 0
                # if new_pos_y > rightY + paddle_height / 2:
                #     new_velocity_y = 20
            if new_pos_x < 0 :
                random_number = random.randint(1, 100)
                if random_number % 2 == 0:
                    new_velocity_y = -4
                else:
                    new_velocity_y = 4
                await self.send(text_data=json.dumps({
                'new_pos_x': canvas_width / 2,
                'new_pos_y': canvas_height / 2,
                'new_velocity_x' : 4,
                'new_velocity_y' : new_velocity_y,
                'score_P1' : score_P1,
                'score_P2' : score_P2 + 1,
            }))
                return
            if new_pos_x > canvas_width :
                random_number = random.randint(1, 100)
                if random_number % 2 == 0:
                    new_velocity_y = -4
                else:
                    new_velocity_y = 4
                await self.send(text_data=json.dumps({
                'new_pos_x': canvas_width / 2,
                'new_pos_y': canvas_height / 2,
                'new_velocity_x' : 4,
                'new_velocity_y' : new_velocity_y,
                'score_P1' : score_P1 + 1,
                'score_P2' : score_P2,
            }))
                return
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
                        rightY = min(height - 100, rightY + 20)
                    elif key == "ArrowUp":
                        rightY = max(0, rightY - 20)
                    elif key == "z":
                        leftY = max(0, leftY - 20)
                    elif key == "s":
                        leftY = min(height - 100, leftY + 20)
                        
            await self.send(text_data=json.dumps({
                'player1_paddle_y': rightY,
                'player2_paddle_y': leftY,
            }))
        