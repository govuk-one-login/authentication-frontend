#!/bin/sh
set -euo

if [ -z "${BASIC_AUTH_USERNAME}" ]; then
  echo >&2 "BASIC_AUTH_USERNAME must be set"
  exit 1
fi

if [ -z "${BASIC_AUTH_PASSWORD}" ]; then
  echo >&2 "BASIC_AUTH_PASSWORD must be set"
  exit 1
fi

if [ -z "${PROXY_PASS}" ]; then
  echo >&2 "PROXY_PASS must be set"
  exit 1
fi

IP_BLOCK_MATCHER="private_ranges"
if [ -n "${IP_ALLOW_LIST:-}" ]; then
  IP_BLOCK_MATCHER="$(echo "${IP_ALLOW_LIST}" | jq -r '. | join(" ")')"
fi
unset IP_ALLOW_LIST
export IP_BLOCK_MATCHER

TRUSTED_PROXIES_IPS=""
if [ -n "${TRUSTED_PROXIES:-}" ]; then
  TRUSTED_PROXIES_IPS="$(echo "${TRUSTED_PROXIES}" | jq -r '. | join(" ")')"
fi
unset TRUSTED_PROXIES
export TRUSTED_PROXIES_IPS

HASHED_PASSWORD="$(caddy hash-password --plaintext "${BASIC_AUTH_PASSWORD}")"
unset BASIC_AUTH_PASSWORD
export HASHED_PASSWORD

exec "$@"
