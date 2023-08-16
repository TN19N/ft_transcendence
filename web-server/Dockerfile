FROM nginx:1.25.1-alpine

RUN apk update && apk upgrade --no-cache \
    && apk add --no-cache gettext

WORKDIR /etc/nginx

COPY ./nginx.conf.template .
COPY ./tools/entrypoint.sh .

RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]

CMD ["nginx"]