#!/bin/bash
sleep 3


python backend/srcs/manage.py makemigrations
python backend/srcs/manage.py migrate
python backend/srcs/manage.py collectstatic --noinput
python /home/backend/srcs/run_uvicorn.py
