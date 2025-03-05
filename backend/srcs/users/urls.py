from django.urls import path
from .views import UserView, LoginView, LogoutView, verify_code, permission_verif, is_token_valid, fetch_user_data, check_auth


urlpatterns = [
    path('login', LoginView.loginUser, name="loginUser"),
    path('logout', LogoutView.logoutUser, name="logoutUser"),
    path('<int:pk>', UserView.userDetails, name="getUser"),
    path('create', UserView.createUser, name="createUser"),
    path('count', UserView.count_users, name="count_users"),
    path('code', verify_code, name="verify_code"),
    path('perms/<int:id>', permission_verif, name="permission_verif"),
    path('token/<str:token>', is_token_valid, name="is_token_valid"),
    path('fetch_user_data', fetch_user_data, name="fetch_user_data"),
    path('check_auth', check_auth, name="check_auth"),
    
]
