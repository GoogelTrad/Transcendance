from django.urls import path
from .views import GameView
from .views import HomeGameView

urlpatterns = [
    path('home_game', HomeGameView.home_page, name="home_game"),
    path('gameDetails', GameView.GameDetails, name="gameDetails"),
    path('gametest', GameView.GameTest, name="gametest"),
    path('keep_score', GameView.keep_score, name="keep_score"),
    path('fetch_data/<int:game_id>/', GameView.fetch_data, name="fetch_data"),
]
