from django.urls import path
from .views import GameView
from .views import HomeGameView

urlpatterns = [
    path('create_game', HomeGameView.create_game, name="create_game"),
    path('gameDetails', GameView.GameDetails, name="gameDetails"),
    path('gametest', GameView.GameTest, name="gametest"),
    # path('update_game', GameView.update_game, name="update_game"),
    path('fetch_data/<int:game_id>/', GameView.fetch_data, name="fetch_data"),
    path('fetch_data_user/<int:user_id>/', GameView.fetch_data_user, name="fetch_data_user"),
]