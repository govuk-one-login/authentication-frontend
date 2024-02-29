#!/usr/bin/env bash
set -eu

CLEAN=0
LOCAL=0
while getopts "cl" opt; do
  case ${opt} in
  l)
    LOCAL=1
    ;;
  c)
    CLEAN=1
    ;;
  *)
    usage
    exit 1
    ;;
  esac
done

if [ $CLEAN == "1" ]; then
  echo "Cleaning dist and node_modules..."
  rm -rf dist
  rm -rf node_modules
  rm -rf logs
fi

echo "Stopping frontend services..."
docker-compose down

if [[ -z "${AWS_ACCESS_KEY_ID:-}" || -z "${AWS_SECRET_ACCESS_KEY:-}" ]]; then
  echo "!! AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set in the environment." >&2
  echo "!! Configure AWS access for either gds-di-development (sandpit) or di-auth-development (authdevs)." >&2
  echo "!! For gds-cli: gds aws digital-identity-dev -- ${0}" >&2
  exit 1
fi

if [ $LOCAL == "1" ]; then
  echo "Starting frontend local service..."
  docker compose -f "docker-compose.yml" up -d --wait --no-deps redis di-auth-stub-default di-auth-stub-no-mfa
  export "$(grep -v '^#' .env | xargs)"
  export REDIS_PORT=6389
  export REDIS_HOST=localhost
  yarn install && yarn copy-assets && yarn dev
else
  echo "Starting frontend service..."
  docker compose up -d --wait --build
fi
