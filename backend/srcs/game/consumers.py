from channels.db import database_sync_to_async
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Game
import random
import asyncio
import time
from channels.layers import get_channel_layer


class GameState:
    def __init__(self, back_dimensions, game):
        self.timer = {
            "seconds": 0,
            "minutes": 3
        }

        self.paddle_data = {
            "paddleRightY": back_dimensions["height"] / 2 - 170 / 3,
            "paddleLeftY": back_dimensions["height"] / 2 - 170 / 3,
            "paddleRightX": back_dimensions["width"] * 0.95 - 17,
            "paddleLeftX": back_dimensions["width"] * 0.05,
            "width": 17,
            "height": 170,
            "height_canvas": back_dimensions["height"],
            "width_canvas": back_dimensions["width"]
        }

        self.pong_data = {
            "pos_x": back_dimensions["width"] / 2,
            "pos_y": back_dimensions["height"] / 2,
            "width": 20,
            "velocity_x": 8,
            "velocity_y": 8
        }

        self.score = {
            "score_P1": 0,
            "score_P2": 0
        }
        self.winner = None
        self.loser = None
        self.player1 = game.player1
        self.player2 = game.player2

    def is_game_over(self):
        if self.score["score_P1"] >= 1:
            self.winner = self.player1
            self.loser = self.player2
            return True
        elif self.score["score_P2"] >= 1:
            self.winner = self.player2
            self.loser = self.player1
            return True
        if self.timer["minutes"] == 0 and self.timer["seconds"] == 0:
            if self.score["score_P1"] > self.score["score_P2"]:
                self.winner = self.player1
                self.loser = self.player2
            else:
                self.winner = self.player2
                self.loser = self.player1
            return True
        return False

    def update(self):
        self.pong_data["pos_x"] += self.pong_data["velocity_x"]
        self.pong_data["pos_y"] += self.pong_data["velocity_y"]

        if self.pong_data["pos_x"] <= 0:
            self.score["score_P2"] += 1
            self.reset_ball(direction=1)

        elif self.pong_data["pos_x"] >= self.paddle_data["width_canvas"]:
            self.score["score_P1"] += 1
            self.reset_ball(direction=-1)

        if self.pong_data["pos_y"] <= 0 or self.pong_data["pos_y"] >= self.paddle_data["height_canvas"]:
            self.pong_data["velocity_y"] *= -1

        if (
            self.pong_data["pos_x"] <= self.paddle_data["paddleLeftX"] + self.paddle_data["width"]
            and self.pong_data["pos_x"] >= self.paddle_data["paddleLeftX"]
            and self.paddle_data["paddleLeftY"] <= self.pong_data["pos_y"] <= self.paddle_data["paddleLeftY"] + self.paddle_data["height"]
        ):
            self.pong_data["velocity_x"] *= -1
            self.pong_data["pos_x"] = self.paddle_data["paddleLeftX"] + self.paddle_data["width"] + 0.1

        if (
            self.pong_data["pos_x"] >= self.paddle_data["paddleRightX"] 
            and self.pong_data["pos_x"] <= self.paddle_data["paddleRightX"] + self.paddle_data["width"]
            and self.paddle_data["paddleRightY"] <= self.pong_data["pos_y"] <= self.paddle_data["paddleRightY"] + self.paddle_data["height"]
        ):
            self.pong_data["velocity_x"] *= -1
            self.pong_data["pos_x"] = self.paddle_data["paddleRightX"] - self.paddle_data["width"] - 0.1

        if self.paddle_data["paddleLeftY"] < 0:
            self.paddle_data["paddleLeftY"] = 0
        if self.paddle_data["paddleLeftY"] + self.paddle_data["height"] > self.paddle_data["height_canvas"]:
            self.paddle_data["paddleLeftY"] = self.paddle_data["height_canvas"] - self.paddle_data["height"]
        
        if self.paddle_data["paddleRightY"] < 0:
            self.paddle_data["paddleRightY"] = 0
        if self.paddle_data["paddleRightY"] + self.paddle_data["height"] > self.paddle_data["height_canvas"]:
            self.paddle_data["paddleRightY"] = self.paddle_data["height_canvas"] - self.paddle_data["height"]

    def reset_ball(self, direction=1):
        self.pong_data["pos_x"] = self.paddle_data["width_canvas"] / 2
        self.pong_data["pos_y"] = self.paddle_data["height_canvas"] / 2
        self.pong_data["velocity_x"] = 8 * direction
        self.pong_data["velocity_y"] = random.choice([-8, 8])

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
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.group_name = f"game_{self.game_id}"
        self.game_state = None
        self.game_running = False
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        print(f"WebSocket connected to game {self.game_id}!", flush=True)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
        print(f"WebSocket disconnected from game {self.game_id} with close code: {close_code}")

    async def receive(self, text_data):
        try:
            data_dict = json.loads(text_data)
        except json.JSONDecodeError:
            print("Error decoding JSON data")
            return

        if "width" in data_dict and not self.game_running:
            game = await self.get_game()
            width = data_dict.get("width")
            height = data_dict.get("height")
            back_dimensions = {"width": width, "height": height}
            self.game_state = GameState(back_dimensions, game)
            print(f"WebSocket connected to game {self.game_id}!", flush=True)
            self.game_running = True
            asyncio.create_task(self.run_game_loop(self.game_state))

        if "isKeyDown" in data_dict:
            key_states = data_dict["isKeyDown"]
            if self.game_state:
                self.handle_key_press(key_states)


    async def send_message(self, message):
        channel_layer = get_channel_layer()
        await channel_layer.group_send(self.group_name, message)


    async def game_update(self, event):
        await self.send(text_data=json.dumps(event))
           
    async def run_game_loop(self, game_state):
        last_time_updated = time.time()
        accumulated_time = 0
        try:
            while True:
                await asyncio.sleep(1 /60)

                if hasattr(self, 'current_key_states'):
                    self.process_key_states(self.current_key_states, game_state)

                game_state.update()
                current_time = time.time()
                time_diff = current_time - last_time_updated
                accumulated_time += time_diff
                last_time_updated = current_time
                if accumulated_time >= 1:
                    accumulated_time = 0
                    if game_state.timer["seconds"] > 0:
                        game_state.timer["seconds"] -= 1
                    elif game_state.timer["minutes"] > 0:
                        game_state.timer["minutes"] -= 1
                        game_state.timer["seconds"] = 59
                await self.send_message({
                    "type": "game_update",
                    "new_pos_x": game_state.pong_data["pos_x"],
                    "new_pos_y": game_state.pong_data["pos_y"],
                    "ball_width": game_state.pong_data["width"],
                    "score_P1": game_state.score["score_P1"],
                    "score_P2": game_state.score["score_P2"],
                    "paddleRightY": game_state.paddle_data["paddleRightY"],
                    "paddleLeftY": game_state.paddle_data["paddleLeftY"],
                    "paddleRightX": game_state.paddle_data["paddleRightX"],
                    "paddleLeftX": game_state.paddle_data["paddleLeftX"],
                    "width": game_state.paddle_data["width"],
                    "height": game_state.paddle_data["height"],
                    "seconds": game_state.timer["seconds"],
                    "minutes": game_state.timer["minutes"],
                })
                if game_state.is_game_over():
                    print(f"Game Over! Winner: {game_state.winner}", flush=True)
                    await self.send_message({
                        "type": "game_update",
                        "score_P1": game_state.score["score_P1"],
                        "score_P2": game_state.score["score_P2"],
                        "winner": game_state.winner,
                        "loser": game_state.loser,
                        "seconds": game_state.timer["seconds"],
                        "minutes": game_state.timer["minutes"],
                    })
                    break

        except asyncio.CancelledError:
            print("Game loop was cancelled", flush=True)
        finally:
            print("Game loop ended", flush=True)
    
    def handle_key_press(self, key_states):
        self.current_key_states = key_states

    def process_key_states(self, key_states, game_state):
        paddle_speed = 10
        if key_states.get("ArrowUp", False):
            game_state.paddle_data["paddleRightY"] = max(
                0, game_state.paddle_data["paddleRightY"] - paddle_speed
            )
        if key_states.get("ArrowDown", False):
            game_state.paddle_data["paddleRightY"] = min(
                game_state.paddle_data["height_canvas"] - game_state.paddle_data["height"],
                game_state.paddle_data["paddleRightY"] + paddle_speed,
            )
        if key_states.get("z", False):
            game_state.paddle_data["paddleLeftY"] = max(
                0, game_state.paddle_data["paddleLeftY"] - paddle_speed
            )
        if key_states.get("s", False):
            game_state.paddle_data["paddleLeftY"] = min(
                game_state.paddle_data["height_canvas"] - game_state.paddle_data["height"],
                game_state.paddle_data["paddleLeftY"] + paddle_speed,
            )