FROM nginx:alpine

ENV NGINX_PORT=8080

RUN apk add --no-cache --update \
      apache2-utils jq

COPY entrypoint.sh /entrypoint.sh
COPY nginx.conf /etc/nginx/templates/default.conf.template

CMD ["nginx", "-g", "daemon off;"]
ENTRYPOINT ["/entrypoint.sh"]