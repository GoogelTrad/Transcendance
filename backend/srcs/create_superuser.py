# create_superuser.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')  # Remplace 'mon_projet' par le nom de ton projet
django.setup()

from users.models import User
from django.contrib.auth import get_user_model

def create_superuser(name, password, email):
    user = get_user_model()
    if not user.objects.filter(name=name).exists():
        user.password = password
        user.admin = True
        user.staff = True
        user.active = True
        user.email = email
        user.save()
        # User.objects.create_superuser(name=name, email=email, password=password)
        print(f'Super utilisateur {name} créé avec succès.')
    else:
        print(f'Le super utilisateur {name} existe déjà.')

if __name__ == "__main__":
    # Récupère les valeurs des variables d'environnement ou utilise des valeurs par défaut
    name = os.environ.get('DJANGO_ADMIN', 'admin')
    password = os.environ.get('DJANGO_PWD', 'adminpassword')
    email = os.environ.get('DJANGO_EMAIL', 'admin@example.com')

    create_superuser(name, password, email)