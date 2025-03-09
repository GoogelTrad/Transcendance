import django
from django.conf import settings
import uvicorn

if __name__ == "__main__":
    django.setup() 
    uvicorn.run(
        "core.asgi:application",
        host="0.0.0.0",
        port=8000,
        ssl_keyfile="/home/certs/server.key",
        ssl_certfile="/home/certs/server.crt",
        app_dir="/home/srcs",
    )