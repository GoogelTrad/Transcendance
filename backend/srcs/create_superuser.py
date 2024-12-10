# create_superuser.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')  # Remplace 'mon_projet' par le nom de ton projet
django.setup()

from users.models import User
from django.contrib.auth import get_user_model

def create_superuser(username, password, email):
    User = get_user_model()
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username=username, email=email, password=password)
        print(f'Super utilisateur {username} créé avec succès.')
    else:
        print(f'Le super utilisateur {username} existe déjà.')

if __name__ == "__main__":
    # Récupère les valeurs des variables d'environnement ou utilise des valeurs par défaut
    username = os.environ.get('DJANGO_ADMIN', 'admin')
    password = os.environ.get('DJANGO_PWD', 'adminpassword')
    email = os.environ.get('DJANGO_EMAIL', 'admin@example.com')

    create_superuser(username, password, email)