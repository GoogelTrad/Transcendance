FROM python:3.11.0-slim

WORKDIR /home

COPY . .

RUN apt update -y
RUN pip install --no-cache-dir -r ./requirements.txt

EXPOSE 8000

CMD ["sh", "./backend/init.sh"]
