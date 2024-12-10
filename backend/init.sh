#!/bin/bash
sleep 3

python backend/srcs/manage.py makemigrations
python backend/srcs/manage.py migrate
python backend/srcs/manage.py dumpdata users.user loaddata backend/srcs/fixtures/user.json
# python backend/srcs/create_superuser.py
python backend/srcs/manage.py runserver 0.0.0.0:8000