from django.urls import path
from .views import send_friend_request, accept_friend_request, decline_friend_request, friends_list, get_friend_requests, searchAddFriend, delete_friends

urlpatterns = [
    path('send/<int:user_id>', send_friend_request, name='send_friend_request'),
    path('accept/<int:request_id>', accept_friend_request, name='accept_friend_request'),
    path('decline/<int:request_id>', decline_friend_request, name='decline_friend_request'),
    path('list/<int:user_id>', friends_list, name='friends_list'),
    path('request/', get_friend_requests, name="get_friends_request"),
    path('search/<str:name>',searchAddFriend, name='searchAddFriend'),
    path('delete/<int:id>', delete_friends, name='delete_friends'),
]