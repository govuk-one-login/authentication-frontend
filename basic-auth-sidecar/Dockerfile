FROM caddy:2.7-alpine

ENV NGINX_PORT=8080

RUN apk add --no-cache --update jq

COPY entrypoint.sh /entrypoint.sh

COPY Caddyfile /etc/caddy/Caddyfile

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
ENTRYPOINT ["/entrypoint.sh"]
