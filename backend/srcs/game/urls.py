from django.urls import path
from .views import GameView, HomeGameView, TournamentView

urlpatterns = [
    path('create_game', HomeGameView.create_game, name="create_game"),
    path('gameDetails', GameView.GameDetails, name="gameDetails"),
    path('gametest', GameView.GameTest, name="gametest"),
    # path('update_game', GameView.update_game, name="update_game"),
    path('fetch_data/<int:game_id>/', GameView.fetch_data, name="fetch_data"),
    path('fetch_data_user/<int:user_id>/', GameView.fetch_data_user, name="fetch_data_user"),
    path('create_tournament', TournamentView.create_tournament, name="create_tournament"),
    path('fetch_data_tournament/<int:tournament_id>/', TournamentView.fetch_data_tournament, name="fetch_data_tournament"),
    path('fetch_data_tournament_by_code/<int:code>/', TournamentView.fetch_data_tournament_by_code, name="fetch_data_tournament_by_code"),
    path('add_player_to_tournament/<int:code>/', TournamentView.add_player_to_tournament, name="add_player_to_tournament"),
    path('fetch_data_tournament_by_user/<int:user_id>/', TournamentView.fetch_data_tournament_by_user, name="fetch_data_tournament_by_user"),

]