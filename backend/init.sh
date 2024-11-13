#!/bin/bash
sleep 3

python backend/srcs/manage.py makemigrations
python backend/srcs/manage.py migrate

python backend/srcs/create_superuser.py
python backend/srcs/manage.py runserver 0.0.0.0:8000