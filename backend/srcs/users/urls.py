from django.urls import path
from .views import RegisterView, loginView
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path('register', RegisterView.as_view(), name="register"),
    path('login', loginView.as_view(), name="login"),
    path('token', TokenObtainPairView.as_view(), name='token_obtain_pair'),
]
