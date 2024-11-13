from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .forms import RegisterForm
from .models import Users

class RegisterView(APIView):
    def post(self, request, *args, **kwargs):
        form = RegisterForm(request.data, request.FILES)
        
        if form.is_valid():
            user = form.save()
            return Response({
                "message": "User registered successfully!",
                "user": {
                    "id": user.id,
                    "pseudo": user.pseudo,
                    "mail": user.mail,
                    "pp": user.pp.url if user.pp else None
                }
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)
