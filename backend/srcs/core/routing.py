from django.urls import path
from livechat.consumers import ChatConsumer, NotificationConsumer
from game.consumers import gameConsumer, MatchmakingConsumer
from django.urls import re_path

websocket_urlpatterns = [
	path('ws/chat/<str:room>', ChatConsumer.as_asgi()),
	re_path(r'ws/game/(?P<game_id>\d+)', gameConsumer.as_asgi()),
    path('ws/matchmaking/', MatchmakingConsumer.as_asgi()),
	path('ws/notifications/', NotificationConsumer.as_asgi()),
]