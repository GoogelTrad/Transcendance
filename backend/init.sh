#!/bin/bash
sleep 3


python backend/srcs/manage.py makemigrations
python backend/srcs/manage.py migrate
# watchfiles "python backend/srcs/manage.py runserver 0.0.0.0:8000"
# WATCHFILES_FORCE_POLLING=true watchfiles "python backend/srcs/manage.py runserver 0.0.0.0:8000"
# python backend/srcs/manage.py runserver 0.0.0.0:8000
WATCHFILES_FORCE_POLLING=true watchfiles "python /home/backend/srcs/run_uvicorn.py"
# uvicorn core.asgi:application --host 0.0.0.0 --port 8000 --ssl-keyfile /home/certs/server.key --ssl-certfile /home/certs/server.crt --app-dir /home/backend/srcs
# WATCHFILES_FORCE_POLLING=true watchfiles "gunicorn --bind 0.0.0.0:8000 core.wsgi --chdir backend/srcs"
