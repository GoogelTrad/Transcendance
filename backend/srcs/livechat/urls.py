from django.urls import path
from . import views

urlpatterns = [
	path("listroom/", views.get_list_rooms, name="list_rooms"),
	path("users_room/<str:name>", views.get_list_users, name="get_list_users")
]