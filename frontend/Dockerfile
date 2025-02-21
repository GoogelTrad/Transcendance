FROM node:23-alpine3.19

COPY core ./

WORKDIR /home/frontend/core/

RUN npm install
RUN npm install react-scripts

EXPOSE 3000

CMD ["npm", "start", "--", "--host", "0.0.0.0"]
