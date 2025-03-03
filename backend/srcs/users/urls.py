from django.urls import path
from .views import UserView, LoginView, LogoutView, verify_code, permission_verif, is_token_valid, get_token


urlpatterns = [
    path('login', LoginView.loginUser, name="loginUser"),
    path('logout', LogoutView.logoutUser, name="logoutUser"),
    path('<int:pk>', UserView.userDetails, name="getUser"),
    path('create', UserView.createUser, name="createUser"),
    path('count', UserView.count_users, name="count_users"),
    path('code', verify_code, name="verify_code"),
    path('perms/<int:id>', permission_verif, name="permission_verif"),
    path('token/<str:token>', is_token_valid, name="is_token_valid"),
    path('get_token/', get_token, name="get_token"),
]
