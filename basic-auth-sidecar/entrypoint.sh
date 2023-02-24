#!/bin/sh

if [ -z $BASIC_AUTH_USERNAME ]; then
  echo >&2 "BASIC_AUTH_USERNAME must be set"
  exit 1
fi

if [ -z $BASIC_AUTH_PASSWORD ]; then
  echo >&2 "BASIC_AUTH_PASSWORD must be set"
  exit 1
fi

if [ -z $PROXY_PASS ]; then
  echo >&2 "PROXY_PASS must be set"
  exit 1
fi

touch /etc/nginx/allow-list.conf
if [ ! -z "$IP_ALLOW_LIST" ]; then
  echo "${IP_ALLOW_LIST}" | jq -r '"allow " + .[] + ";"' >> /etc/nginx/allow-list.conf
fi

touch /etc/nginx/trusted-proxies.conf
if [ ! -z "$TRUSTED_PROXIES" ]; then
  echo "${TRUSTED_PROXIES}" | jq -r '"set_real_ip_from " + .[] + ";"' >> /etc/nginx/trusted-proxies.conf
fi

htpasswd -bBc /etc/nginx/.htpasswd "${BASIC_AUTH_USERNAME}" "${BASIC_AUTH_PASSWORD}"

exec /docker-entrypoint.sh "$@"
