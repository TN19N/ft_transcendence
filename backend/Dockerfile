FROM node:18-alpine

RUN apk update && apk upgrade --no-cache

WORKDIR /app

COPY . .

RUN npm install

CMD npm run migrate:start