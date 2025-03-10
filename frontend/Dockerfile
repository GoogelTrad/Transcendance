FROM node:23-alpine3.19

WORKDIR /home/frontend/core/
COPY core ./

RUN npm install
RUN npm install react-scripts
RUN npm install -g serve

RUN npm run build

EXPOSE 3000

CMD ["serve", "-s", "build", "--listen", "tcp://0.0.0.0:3000", "--ssl-cert", "/home/certs/server.crt", "--ssl-key", "/home/certs/server.key"]