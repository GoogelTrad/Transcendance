from django.http import JsonResponse, HttpResponseRedirect
from rest_framework.response import Response
from django.conf import settings
from django.utils.timezone import now
from rest_framework import status
from users.models import User, ValidToken
from users.serializer import UserSerializer
from django.core.files.base import ContentFile
from urllib.parse import urlencode
from users.views import send_confirmation_email
import requests
import os
import jwt

CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET')
REDIRECT_URI = os.getenv('REDIRECT_URI')
TOKEN_URL = os.getenv('TOKEN_URL')
USER_INFO_URL = os.getenv('USER_INFO_URL')

def oauth_callback(request):
    return HttpResponseRedirect(os.getenv('REDIRECT_URL'))

def oauth_login(request):
	if 'code' not in request.GET:
		params = urlencode({'status': 'ACCESS_DENIED', 'name': None})
		return HttpResponseRedirect(f"{os.getenv('REACT_APP_URL_REACT')}/auth-success?{params}")

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

			if  User.objects.filter(email=user_data['email']).exists() and not User.objects.filter(name=user_data['login']).exists():
				params = urlencode({'status': 'EMAIL_TAKEN', 'name': None})
				return HttpResponseRedirect(f"{os.getenv('REACT_APP_URL_REACT')}/auth-success?{params}")

			if User.objects.filter(name=user_data['login']).exists() and not User.objects.filter(email=user_data['email']).exists():
				number = 1
				while User.objects.filter(name=user_data['login']).exists() and not User.objects.filter(email=user_data['email']).exists():
					new_name = user_data['login']
					user_data['login'] = new_name + str(number)
					number += 1


			if User.objects.filter(name=user_data['login']).exists() and User.objects.filter(email=user_data['email']).exists():

				user = User.objects.get(email=user_data['email'])
				user_data['login'] = user.name
			else :
				user, created = User.objects.get_or_create(
					email=user_data['email'], 
					defaults={
						'name': user_data['login'],
						'status': 'online',
						'is_stud': True,
					}
				)
				
			if user.enable_verified is True:
				send_confirmation_email(user)
				params = urlencode({'status': '2FA_REQUIRED', 'name': user.name})
				return HttpResponseRedirect(f"{os.getenv('REACT_APP_URL_REACT')}/auth-success?{params}")

			user.status = 'online'
			user.save()
	
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
				'enable_verified': serializer.instance.enable_verified,
            }

			jwt_token = jwt.encode(payload, os.getenv('JWT_KEY'), algorithm='HS256')

			if ValidToken.objects.filter(user=user).exists():
				ValidToken.objects.filter(user=user).delete()
			ValidToken.objects.create(user=user, token=jwt_token)

			params = urlencode({'status': 'SUCCESS', 'token': jwt_token})
			response = HttpResponseRedirect(f"{os.getenv('REACT_APP_URL_REACT')}/auth-success?{params}")
			response.set_cookie(key='token', value=jwt_token, max_age=int(os.getenv('TOKEN_TIME')), httponly=True, secure=True, samesite='None')
			return response

		else:
			return JsonResponse({'error': 'Failed to fetch user data'}, status=400)
	else:
		return JsonResponse({'error': 'Cannot exchange code'}, status=400)
