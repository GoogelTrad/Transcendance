from django.urls import path
from .views import GameView
from .views import HomeGameView

urlpatterns = [
    path('create_game', HomeGameView.create_game, name="create_game"),
    path('create_game_multi', HomeGameView.create_game_multi, name="create_game_multi"),
    path('gameDetails', GameView.GameDetails, name="gameDetails"),
    path('gametest', GameView.GameTest, name="gametest"),
    # path('update_game', GameView.update_game, name="update_game"),
    path('fetch_data/<int:game_id>/', GameView.fetch_data, name="fetch_data"),
    path('status/<int:game_id>/', HomeGameView.game_status, name="game_status"),
]
