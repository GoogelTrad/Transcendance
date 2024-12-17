from django.urls import path
from .views import GameView
from .views import HomeGameView

urlpatterns = [
    path('create_game', HomeGameView.create_game, name="create_game"),
    path('gameDetails', GameView.GameDetails, name="gameDetails"),
    path('gametest', GameView.GameTest, name="gametest"),
    # path('update_game', GameView.update_game, name="update_game"),
    path('fetch_data/<int:game_id>/', GameView.fetch_data, name="fetch_data"),
    path('paddle_up/<int:game_id>', GameView.paddle_up, name="paddle_up"),
    path('paddle_down/<int:game_id>', GameView.paddle_down, name="paddle_down"),
]
