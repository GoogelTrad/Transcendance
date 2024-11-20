from django.urls import path
from .views import GameView


urlpatterns = [
    path('game', GameView.home_page, name="game"),
]
