#!/bin/bash
sleep 3

python backend/srcs/manage.py makemigrations
python backend/srcs/manage.py migrate
# python backend/srcs/manage.py dumpdata users.user loaddata backend/srcs/fixtures/user.json
# python backend/srcs/create_superuser.py
# watchfiles "python backend/srcs/manage.py runserver 0.0.0.0:8000"
# WATCHFILES_FORCE_POLLING=true watchfiles "python backend/srcs/manage.py runserver 0.0.0.0:8000"
WATCHFILES_FORCE_POLLING=true watchfiles "gunicorn --bind 0.0.0.0:8000 core.wsgi --chdir backend/srcs"

# python -m watchfiles --filter python -- "backend/srcs/manage.py runserver 0.0.0.0:8000"
# watchmedo auto-restart --directory=backend/srcs --pattern=*.py --recursive -- python backend/srcs/manage.py runserver 0.0.0.0:8000
