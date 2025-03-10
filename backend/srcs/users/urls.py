from django.urls import path
from .views import UserView, LoginView, LogoutView, verify_code, permission_verif, fetch_user_data, check_auth, help_me


urlpatterns = [
    path('login', LoginView.loginUser, name="loginUser"),
    path('logout', LogoutView.logoutUser, name="logoutUser"),
    path('<int:pk>', UserView.userDetails, name="getUser"),
    path('create', UserView.createUser, name="createUser"),
    path('code', verify_code, name="verify_code"),
    path('perms/<int:id>', permission_verif, name="permission_verif"),
    path('fetch_user_data', fetch_user_data, name="fetch_user_data"),
    path('check_auth', check_auth, name="check_auth"),
    path('help_me', help_me, name="help_me")
]
