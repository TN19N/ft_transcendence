FROM node:18-alpine

RUN apk update && apk upgrade --no-cache 


WORKDIR /app/frontend/

COPY ./transce .

RUN    npm install 
RUN    npm i @chakra-ui/react @emotion/react @emotion/styled framer-motion 
RUN    npm i @tanstack/react-query@4.28 
RUN    npm install axios
RUN    npm i react-router-dom@6.10.0
RUN    npm install cors


CMD ["npm", "run", "dev", "--","--host", "0.0.0.0"] 
