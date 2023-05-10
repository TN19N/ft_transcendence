FROM node:18

RUN apt update

WORKDIR /app

COPY . .

RUN npm install

CMD npm run migration:start