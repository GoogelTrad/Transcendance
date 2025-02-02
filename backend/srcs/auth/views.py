from django.http import JsonResponse, HttpResponseRedirect
from rest_framework.response import Response
from django.conf import settings
from users.models import User, ValidToken
from users.serializer import UserSerializer
from django.core.files.base import ContentFile
import requests
import jwt

CLIENT_ID = "u-s4t2ud-97a76a28de78dd428adce0b4c6dfb9d67eb9bd507bb9575328171c1c6b0d4555"
CLIENT_SECRET = "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"
REDIRECT_URI = "http://localhost:8000/auth/log"
TOKEN_URL = "https://api.intra.42.fr/oauth/token"
USER_INFO_URL = "https://api.intra.42.fr/v2/me"


def oauth_callback(request):
    authorization_url = f"https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-97a76a28de78dd428adce0b4c6dfb9d67eb9bd507bb9575328171c1c6b0d4555&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Fauth%2Flog&response_type=code"
    return HttpResponseRedirect(authorization_url)

def oauth_login(request):
	if 'code' not in request.GET:
		return JsonResponse({'error': 'Code non fourni'}, status=400)

	code = request.GET['code']
	payload = {
		'grant_type': 'authorization_code',
		'code': code,
		'client_id': CLIENT_ID,
		'client_secret': CLIENT_SECRET,
		'redirect_uri': REDIRECT_URI,
	}

	response = requests.post(TOKEN_URL, data=payload)

	if response.status_code == 200:
		token_data = response.json()
		access_token = token_data['access_token']

		user_info = requests.get(USER_INFO_URL, headers={'Authorization': f'Bearer {access_token}'})
		if user_info.status_code == 200:
			user_data = user_info.json()

			user, created = User.objects.get_or_create(
				email=user_data['email'], 
				defaults={
					'name': user_data['login'],
					'status': 'online',
					'is_stud': True,
				}
			)
			if not user.profile_image:
				profile_image_data = user_data.get('image', {})
				profile_image_url = profile_image_data.get('versions', {}).get('small')
				if profile_image_url:
					response = requests.get(profile_image_url)
					if response.status_code == 200:
						file_name = f"{user_data['login']}_profile.jpg"
						user.profile_image.save(file_name, ContentFile(response.content), save=True)


			serializer = UserSerializer(user, data={
				'name': user_data['login'],
				'email': user_data['email'],
				'status': 'online',
				'is_stud': True,
			}, partial=True) 
			serializer.is_valid(raise_exception=True)
			serializer.save()

			payload = {
				'id': serializer.instance.id,
                'name': serializer.instance.name,
                'email': serializer.instance.email,
                'status': serializer.instance.status,
                'is_stud': serializer.instance.is_stud,
            }

			jwt_token = jwt.encode(payload, 'coucou', algorithm='HS256')

			if ValidToken.objects.filter(user=user).exists():
				ValidToken.objects.filter(user=user).delete()
			ValidToken.objects.create(user=user, token=jwt_token)

			response = HttpResponseRedirect("http://localhost:3000/home")
			response.set_cookie(key='token', value=jwt_token, max_age=3600)
			return response

		else:
			return JsonResponse({'error': 'Impossible de récupérer les infos utilisateur'}, status=400)
	else:
		return JsonResponse({'error': 'Échec lors de l\'échange du code'}, status=400)
