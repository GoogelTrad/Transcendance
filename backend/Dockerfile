FROM python:3.11.0-slim

WORKDIR /home

COPY . .

RUN apt update -y
RUN apt install python-dev -y
RUN apt install libevent-dev -y
RUN apt install -y libpq-dev gcc
RUN pip install --upgrade pip
RUN pip install --upgrade setuptools wheel
# RUN pip install --verbose django-socketio
# RUN pip install --no-cache-dir gunicorn
# RUN pip install --no-cache-dir eventlet
RUN pip install --no-cache-dir daphne
RUN pip install --no-cache-dir django-seed
RUN pip install --no-cache-dir -r ./requirements.txt

EXPOSE 8000

CMD ["sh", "./backend/init.sh"]
# ENTRYPOINT ["tail", "-f", "/dev/null"]