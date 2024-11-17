FROM node:23-alpine3.19

WORKDIR /home

COPY . .

WORKDIR /home/frontend/core/
# RUN npm install

EXPOSE 3000

CMD ["npm", "start"]
# ENTRYPOINT ["tail", "-f", "/dev/null"]