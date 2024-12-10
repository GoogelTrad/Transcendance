from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import re_path
from .consumers import gameConsumer

websocket_urlpatterns = [
    re_path(r'ws/game/$', gameConsumer.as_asgi()),
]