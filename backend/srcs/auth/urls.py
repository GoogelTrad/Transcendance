from django.urls import path
from .views import oauth_login, oauth_callback

urlpatterns = [
    path('code/', oauth_callback, name='code'),
    path('log/', oauth_login, name='log'),
]