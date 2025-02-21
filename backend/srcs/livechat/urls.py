from django.urls import path
from . import views

urlpatterns = [
	path("listroom/", views.get_list_rooms, name="list_rooms"),
	path("users_room/<str:name>", views.get_list_users, name="get_list_users"),
	path('exit-room/', views.exit_room, name='exit_room'),
	path('save_chat_msg/', views.save_chat_msg, name='save_chat_msg'),
	path('send-notification/', views.send_notification, name='send_notification'),
	path("users_connected/", views.get_users_connected, name='get_users_connected')
]
