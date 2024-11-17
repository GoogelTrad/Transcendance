from django.urls import path
from .views import UserView, LoginView


urlpatterns = [
    path('login', LoginView.loginUser, name="loginUser"),
    # path('logout', LogoutView.as_view()),
    path('user/<int:pk>', UserView.userDetails, name="getUser"),
    path('user/create/', UserView.createUser, name="createUser"),
]
