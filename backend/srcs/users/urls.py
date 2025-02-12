from django.urls import path
from .views import UserView, LoginView, LogoutView, verify_code


urlpatterns = [
    path('login', LoginView.loginUser, name="loginUser"),
    path('logout', LogoutView.logoutUser, name="logoutUser"),
    path('user/<int:pk>', UserView.userDetails, name="getUser"),
    path('user/create', UserView.createUser, name="createUser"),
    path('user/count', UserView.count_users, name="count_users"),
    path('code', verify_code, name="verify_code"),
]
