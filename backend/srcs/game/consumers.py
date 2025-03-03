from channels.db import database_sync_to_async
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.exceptions import MultipleObjectsReturned
from .models import Game, Tournament
from users.models import User
import random
import asyncio
import time
import requests
from channels.layers import get_channel_layer
import jwt
import copy
import os

class TournamentConsumer(AsyncWebsocketConsumer):
    tournament_states = {}
    tournament = {}
    processed_messages = set()

    def __init__(self):  
            self.groups = []
            self.tournament_code = None
            self.token = None
            self.user = None
            self.group_name = None

    async def connect(self):
        self.tournament_code = self.scope['url_route']['kwargs']['tournament_code']
        self.token = self.scope['cookies'].get('token')
        self.user = await self.authenticate_user(self.token)
        
        tournament = await self.get_tournament(self.tournament_code)
        if tournament:
            TournamentConsumer.tournament[self.tournament_code] = tournament
        else:
            await self.close()
            return
        
        self.group_name = f'tournament_{self.tournament_code}'
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        if not self.user:
            await self.close()
            return

        if self.user.name in [tournament.player1, tournament.player2, tournament.player3, tournament.player4]:
            await self.accept()
        else:
            await self.add_user_to_tournament()
            await self.accept()
            await self.send_user_connected_message()
            game_group = f"game_{self.tournament_code}"
            await self.channel_layer.group_add(game_group, self.channel_name)
            print(f"User {self.user.name} added to group {game_group}", flush=True)

            if self.tournament_code not in TournamentConsumer.tournament_states:
                TournamentConsumer.tournament_states[self.tournament_code] = {"games_finished": 0}

    async def disconnect(self, close_code):
        print(f"Removed from tournament", flush=True)
        if self.tournament_code in TournamentConsumer.tournament:
            del TournamentConsumer.tournament[self.tournament_code]

    @database_sync_to_async
    def fetch_nbr_games(self):
        tournament = TournamentConsumer.tournament.get(self.tournament_code)
        if tournament:
            count = tournament.gamesTournament.count()
            print(f"Games count: {count}", flush=True)
            return count
        return 0

    @database_sync_to_async
    def add_user_to_tournament(self):
        tournament = TournamentConsumer.tournament.get(self.tournament_code)
        if tournament:
            if not tournament.player1:
                tournament.player1 = self.user.name
            elif not tournament.player2:
                tournament.player2 = self.user.name
            elif not tournament.player3:
                tournament.player3 = self.user.name
            elif not tournament.player4:
                tournament.player4 = self.user.name
            tournament.players_connected += 1
            tournament.save()


    async def send_user_connected_message(self):
        tournament = TournamentConsumer.tournament.get(self.tournament_code)
        if tournament:
            message = {
                'type': 'user_connected',
                'username': self.user.name,
                'players_connected': tournament.players_connected,
                'code': self.tournament_code,
            }

            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'user_connected_message',
                    'message': message
                }
            )

    async def user_connected_message(self, event):
        await self.send(text_data=json.dumps(event))

    async def game_update(self, event):
        await self.send(text_data=json.dumps(event))

    async def start_game(self, game_id, player1, player2):
        group_name = f"game_{self.tournament_code}"
        print(f"Starting game {game_id} for group {group_name}", flush=True)
        await self.channel_layer.group_send(
            group_name,
            {
                "type": "game_update",
                "game_id": game_id,
                "player1" : player1,
                "player2" : player2,
            }
        )

    async def start_first_match(self):
        tournament = TournamentConsumer.tournament.get(self.tournament_code)
        if tournament:
            if tournament.size == 2 and tournament.players_connected == 2:
                if tournament.player1 and tournament.player2:
                    game_data_1 = await self.create_Game_Multi(
                        self.token, tournament.player1, tournament.player2
                    )
                    if game_data_1:
                        await self.start_game(game_data_1['id'], tournament.player1, tournament.player2)

            if tournament.size == 4 and tournament.players_connected == 4:
                if tournament.player1 and tournament.player2:
                    game_data_1 = await self.create_Game_Multi(
                        self.token, tournament.player1, tournament.player2
                    )
                    if game_data_1:
                        await self.start_game(game_data_1['id'], tournament.player1, tournament.player2)
                if tournament.player3 and tournament.player4:
                    game_data_2 = await self.create_Game_Multi(
                        self.token, tournament.player3, tournament.player4
                    )
                    if game_data_2:
                        await self.start_game(game_data_2['id'], tournament.player3, tournament.player4)

    async def start_finale(self):
        tournament = TournamentConsumer.tournament.get(self.tournament_code)
        if tournament:
            print(tournament.winner1, flush=True)
            print(tournament.winner2, flush=True)
            if tournament.winner1 and tournament.winner2:
                final_game_data = await self.create_Game_Multi(self.token, tournament.winner1, tournament.winner2)
                if final_game_data:
                    await self.start_game(final_game_data['id'], tournament.winner1, tournament.winner2)

    async def receive(self, text_data):
        try:
            data_dict = json.loads(text_data)
        except json.JSONDecodeError:
            print("Error decoding JSON data")
            return
        print("receive :", data_dict, flush=True)
        
        if "Start" in data_dict:  
            tournament = TournamentConsumer.tournament.get(self.tournament_code)
            if tournament:
                if tournament.players_connected == 2 and tournament.size == 2 and await self.fetch_nbr_games() < 3:
                    await self.start_first_match()
                elif tournament.players_connected == 4 and tournament.size == 4 and await self.fetch_nbr_games() < 2:
                    await self.start_first_match()
                elif tournament.players_connected == 4 and tournament.size == 4 and await self.fetch_nbr_games() == 2:
                    await self.start_finale()

    @database_sync_to_async
    def create_game_directly(self, player1, player2, timeSeconds, timeMinutes, scoreMax, tournamentCode):
        try:
            game = Game.objects.create(
                player1=player1,
                player2=player2,
                isInTournament=True,
                timeSeconds=timeSeconds,
                timeMinutes=timeMinutes,
                scoreMax=scoreMax,
                tournamentCode=tournamentCode
            )
            TournamentConsumer.tournament[self.tournament_code].gamesTournament.add(game) 
            print(f"Game created directly - ID: {game.id}, Player1: {game.player1}, Player2: {game.player2}", flush=True)
            return {
                'id': game.id,
                'player1': game.player1,
                'player2': game.player2,
            }
        except Exception as e:
            print(f"Error creating game directly: {e}", flush=True)
            return None

    async def create_Game_Multi(self, token, player1, player2):
        
        timeSeconds = TournamentConsumer.tournament[self.tournament_code].timeMaxSeconds 
        timeMinutes = TournamentConsumer.tournament[self.tournament_code].timeMaxMinutes
        scoreMax = TournamentConsumer.tournament[self.tournament_code].scoreMax
        tournement_code = self.tournament_code
        
        game_data = await self.create_game_directly(player1, player2, timeSeconds, timeMinutes, scoreMax, tournement_code)

        if game_data:
            print('Game created successfully in create_Game_Multi:', game_data, flush=True)
            return game_data
        else:
            print("Failed to create game in create_Game_Multi", flush=True)
            return None

            
    async def authenticate_user(self, token):
        try:
            payload = jwt.decode(token, "coucou", algorithms=["HS256"])
            user_id = payload.get('id')
            if user_id:
                user = await self.get_user_from_id(user_id)
                if user:
                    return user
            return None
        except jwt.ExpiredSignatureError:
            print("Token expired")
        except jwt.InvalidTokenError:
            print("Invalid token")
        return None
    
    @database_sync_to_async
    def get_user_from_id(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    @database_sync_to_async
    def get_tournament(self, tournament_code):
        try:
            tournaments = Tournament.objects.filter(code=tournament_code)
            
            if tournaments.count() > 1:
                raise MultipleObjectsReturned(f"More than one tournament found with the code: {tournament_code}")
            
            if tournaments.exists():
                return tournaments.first()
            else:
                return None

        except MultipleObjectsReturned as e:
            print(f"Error: {e}")
            return None
        except Exception as e:
            print(f"Error fetching tournament: {e}")
            return None

matchmaking_queue = []

class MatchmakingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        token = self.scope['cookies'].get('token')
        print("coucou",token, flush=True)
        if token:
            user = await self.authenticate_user(token)
            if user:
                self.user = user
                self.user.auth_token = token
                await self.accept()
            else:
                await self.close()
        else:
            await self.close()

    async def disconnect(self, close_code):
        global matchmaking_queue
        if self.channel_name in matchmaking_queue:
            matchmaking_queue.remove(self.channel_name)
            print(f"User {self.user} removed from the matchmaking queue")

    async def receive(self, text_data):
        global matchmaking_queue
        text_data_json = json.loads(text_data)

        if text_data_json.get("type") == "join":
            print(f"User {self.user} joining matchmaking", flush=True)
            matchmaking_queue.append({
                'player_name': self.user,
                'channel_name': self.channel_name
            })
            print(f"User {self.user} added to matchmaking queue", flush=True)

            gameData = None
            print('queue :', matchmaking_queue, flush=True)
            if len(matchmaking_queue) >= 2:
                player1 = matchmaking_queue.pop(0)
                player2 = matchmaking_queue.pop(0)
                if player1['player_name'] != player2['player_name']:
                    gameData = await self.create_Game_Multi(player1['player_name'], player2['player_name'])
                else:
                    matchmaking_queue.append({
                    'player_name': self.user,
                    'channel_name': self.channel_name
                })
            if gameData:
                game_id = gameData['id']
                await self.start_game(game_id, player1['channel_name'], player2['channel_name'])
        if text_data_json.get("type") == "leave":
            if (len(matchmaking_queue) >= 1):
                matchmaking_queue = [player for player in matchmaking_queue if player['player_name'] != self.user]



    async def authenticate_user(self, token):
        try:
            payload = jwt.decode(token, "coucou", algorithms=["HS256"])
            user_id = payload.get('id')
            if user_id:
                user = await self.get_user_from_id(user_id)
                if user:
                    return user
            return None
        except jwt.ExpiredSignatureError:
            print("Token expired")
        except jwt.InvalidTokenError:
            print("Invalid token")
        return None
    
    @database_sync_to_async
    def get_user_from_id(self, user_id):
        from users.models import User
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    @database_sync_to_async
    def create_game_directly(self, player1, player2):
        try:
            game = Game.objects.create(
                player1=player1,
                player2=player2,
            )
            print(f"Game created directly - ID: {game.id}, Player1: {game.player1}, Player2: {game.player2}", flush=True)
            return {
                'id': game.id,
                'player1': game.player1,
                'player2': game.player2,
            }
        except Exception as e:
            print(f"Error creating game directly: {e}", flush=True)
            return None

    async def create_Game_Multi(self, player1, player2):
        game_data = await self.create_game_directly(player1, player2)
        if game_data:
            print('Game created successfully in create_Game_Multi:', game_data, flush=True)
            return game_data
        else:
            print("Failed to create game in create_Game_Multi", flush=True)
            return None

    async def game_update(self, event):
        await self.send(text_data=json.dumps(event))

    async def start_game(self, game_id, player1, player2):
        await self.channel_layer.send(player1, {
            "type": "game_update", 
            "game_id": game_id,
        })
        await self.channel_layer.send(player2, {
            "type": "game_update",
            "game_id": game_id,
        })
        group_name = f"game_{game_id}"
        await self.channel_layer.group_add(group_name, player1)
        await self.channel_layer.group_add(group_name, player2)

class GameState:
    def __init__(self, game):
        self.timer = {
            "seconds": game.timeSeconds,
            "minutes": game.timeMinutes,
        }
        self.paddle_data = {
            "paddleRightY": 826 / 2 - 170 / 3,
            "paddleLeftY": 826 / 2 - 170 / 3,
            "paddleRightX": 1536 * 0.95 - 17,
            "paddleLeftX": 1536 * 0.05,
            "width": 17,
            "height": 170,
            "height_canvas": 826,
            "width_canvas": 1536
        }

        self.pong_data = {
            "pos_x": 1536 / 2,
            "pos_y": 826 / 2,
            "width": 20,
            "velocity_x": 6,
            "velocity_y": 6
        }

        self.score = {
            "score_P1": 0,
            "score_P2": 0
        }
        self.winner = None
        self.loser = None
        self.player1 = game.player1
        self.player2 = game.player2
        self.eloPlayer1 = game.elo_Player1
        self.eloPlayer2 = game.elo_Player2
        self.isInTournament = game.isInTournament
        self.code = game.tournamentCode
        self.gamerunning = False

    def is_game_over(self, game):
        if self.score["score_P1"] >= game.scoreMax:
            self.winner = self.player1
            self.loser = self.player2
            return True
        elif self.score["score_P2"] >= game.scoreMax:
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
    
    def update_Elo(self):
        if self.winner == self.player1:
            self.eloPlayer1 += 10 + (self.eloPlayer2 * 0.1)
            if self.eloPlayer2 < 10 + (self.eloPlayer2 * 0.1) :
                self.eloPlayer2 = 0
            else :
                self.eloPlayer2 -= 10 - (self.eloPlayer2 * 0.1)
        if self.winner == self.player2:
            self.eloPlayer2 += 10 + (self.eloPlayer1 * 0.1)
            if self.eloPlayer1 < 10 + (self.eloPlayer1 * 0.1) :
                self.eloPlayer1 = 0
            else:
                self.eloPlayer1 -= 10 - (self.eloPlayer1 * 0.1)


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
            if self.pong_data["velocity_x"] >= -16 and self.pong_data["velocity_x"] <= 16:
                self.pong_data["velocity_x"] *= 1.1
            self.pong_data["pos_x"] = self.paddle_data["paddleLeftX"] + self.paddle_data["width"] + 0.1

        if (
            self.pong_data["pos_x"] >= self.paddle_data["paddleRightX"] 
            and self.pong_data["pos_x"] <= self.paddle_data["paddleRightX"] + self.paddle_data["width"]
            and self.paddle_data["paddleRightY"] <= self.pong_data["pos_y"] <= self.paddle_data["paddleRightY"] + self.paddle_data["height"]
        ):
            self.pong_data["velocity_x"] *= -1
            if self.pong_data["velocity_x"] >= -16 and self.pong_data["velocity_x"] <= 16:
                self.pong_data["velocity_x"] *= 1.1
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
        self.pong_data["velocity_x"] = 6 * direction
        self.pong_data["velocity_y"] = random.choice([-8, 8])

class gameConsumer(AsyncWebsocketConsumer):

    game_states = {}
    paddle_data = {}
    current_key_states_P1 = {}
    current_key_states_P2 = {}
    player = {}

    def __init__(self):  
        self.game_running = False
        self.groups = []
        
    @database_sync_to_async
    def get_game(self, game_id):
        try:
            return Game.objects.get(id=game_id)
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
        if self.game_id not in gameConsumer.game_states:
            game = await self.get_game(self.game_id)
            gameConsumer.game_states[self.game_id] = GameState(game)
        self.game_state = gameConsumer.game_states[self.game_id]

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
        if self.game_id in gameConsumer.paddle_data:
            del gameConsumer.paddle_data[self.game_id]
        if self.game_id in gameConsumer.current_key_states_P1:
            del gameConsumer.current_key_states_P1[self.game_id]
        if self.game_id in gameConsumer.current_key_states_P2:
            del gameConsumer.current_key_states_P2[self.game_id]
        if self.game_id in gameConsumer.player:
            gameConsumer.player[self.game_id] = ""
        print(f"WebSocket disconnected from game {self.game_id} with close code: {close_code}")

    async def receive(self, text_data):
        try:
            data_dict = json.loads(text_data)
        except json.JSONDecodeError:
            print("Error decoding JSON data")
            return
        if "message" in data_dict:
            print(f"WebSocket connected to game {self.game_id}!", flush=True)
            self.game_running = True
            game = await self.get_game(self.game_id)
            asyncio.create_task(self.run_game_loop(self.game_state, game))
        if "isKeyDown" in data_dict:
            gameConsumer.paddle_data[self.game_id] = {
                "isKeyDown": data_dict["isKeyDown"],
                "player": data_dict["player"]
            }
            self.handle_key_press(gameConsumer.paddle_data[self.game_id])

    async def send_message(self, message):
        channel_layer = get_channel_layer()
        await channel_layer.group_send(self.group_name, message)

    async def game_update(self, event):
        await self.send(text_data=json.dumps(event))
           
    async def run_game_loop(self, game_state, game):
        print("states : ", gameConsumer.game_states[self.game_id].gamerunning, flush=True)
        if gameConsumer.game_states[self.game_id].gamerunning == True:
            return
        gameConsumer.game_states[self.game_id].gamerunning = True
        print("states after : ", gameConsumer.game_states[self.game_id].gamerunning, flush=True)
        last_time_updated = time.time()
        accumulated_time = 0
        try:
            while True:
                await asyncio.sleep(1 /60)
                if self.game_id in gameConsumer.current_key_states_P1:
                    self.process_key_states_P1(gameConsumer.current_key_states_P1[self.game_id], game_state)
                if self.game_id in gameConsumer.current_key_states_P2:
                    self.process_key_states_P2(gameConsumer.current_key_states_P2[self.game_id], game_state)
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
                if game_state.is_game_over(game):
                    print(f"Game Over! Winner: {game_state.winner}", flush=True)
                    print(f"Game Over! Loser: {game_state.loser}", flush=True)
                    print(f"Game Over! : {game_state.isInTournament}", flush=True)
                    gameConsumer.game_states[self.game_id].gamerunning = False
                    game_state.update_Elo()
                    await self.send_message({
                        "type": "game_update",
                        "score_P1": game_state.score["score_P1"],
                        "score_P2": game_state.score["score_P2"],
                        "winner": game_state.winner,
                        "loser": game_state.loser,
                        "seconds": game_state.timer["seconds"],
                        "minutes": game_state.timer["minutes"],
                        "elo_Player1" : game_state.eloPlayer1,
                        "elo_Player2" : game_state.eloPlayer2,
                        "isInTournament" : game_state.isInTournament,
                        "code" : game_state.code,
                    })
                    break

        except asyncio.CancelledError:
            print("Game loop was cancelled", flush=True)
        finally:
            print("Game loop ended", flush=True)
    
    def handle_key_press(self, key_states):
        gameConsumer.player[self.game_id] = key_states.get("player", "P1")
        if gameConsumer.player[self.game_id] == "P1" :
            gameConsumer.current_key_states_P1[self.game_id] = key_states.get("isKeyDown")
        elif gameConsumer.player[self.game_id] == "P2" :
            gameConsumer.current_key_states_P2[self.game_id] = key_states.get("isKeyDown")
        if self.game_id in gameConsumer.paddle_data:
            del gameConsumer.paddle_data[self.game_id]

    def process_key_states_P1(self, key_states, game_state):
        paddle_speed = 15
        if key_states.get("ArrowUp", False):
            game_state.paddle_data["paddleLeftY"] = max(
                0, game_state.paddle_data["paddleLeftY"] - paddle_speed
            )
        if key_states.get("ArrowDown", False):
            game_state.paddle_data["paddleLeftY"] = min(
                game_state.paddle_data["height_canvas"] - game_state.paddle_data["height"],
                game_state.paddle_data["paddleLeftY"] + paddle_speed,
            )
    def process_key_states_P2(self, key_states, game_state):
        paddle_speed = 15
        if key_states.get("ArrowUp", False):
            game_state.paddle_data["paddleRightY"] = max(
                0, game_state.paddle_data["paddleRightY"] - paddle_speed
            )
        if key_states.get("ArrowDown", False):
            game_state.paddle_data["paddleRightY"] = min(
                game_state.paddle_data["height_canvas"] - game_state.paddle_data["height"],
                game_state.paddle_data["paddleRightY"] + paddle_speed,
            )

