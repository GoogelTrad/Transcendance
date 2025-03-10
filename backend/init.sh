#!/bin/bash
sleep 3


python backend/srcs/manage.py makemigrations
python backend/srcs/manage.py migrate

WATCHFILES_FORCE_POLLING=true watchfiles "python /home/backend/srcs/run_uvicorn.py" --filter python
