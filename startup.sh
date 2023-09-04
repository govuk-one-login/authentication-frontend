#!/usr/bin/env bash
set -eu

CLEAN=0
LOCAL=0
LOGS=0
while getopts "clg" opt; do
  case ${opt} in
    l)
        LOCAL=1
      ;;
    c)
        CLEAN=1
      ;;
    g)
        LOGS=1
      ;;
    *)
        usage
        exit 1
      ;;
  esac
done

./shutdown.sh

if [ $CLEAN == "1" ]; then
  echo "Cleaning dist and node_modules..."
  rm -rf dist
  rm -rf node_modules
  rm -rf logs
fi

if [ $LOCAL == "1" ]; then
  echo "Starting frontend local service..."
  docker compose -f "docker-compose.yml" up -d --wait --no-deps redis di-auth-stub-default di-auth-stub-no-mfa
  export $(grep -v '^#' .env | xargs)
  export REDIS_PORT=6389
  export REDIS_HOST=localhost
  if [ $CLEAN == "1" ]; then
    yarn install
  fi
  yarn copy-assets
  if [ $LOGS == "1" ]; then
    echo "frontend auth is starting, check logs/frontend-auth.log for details..."
    mkdir -p logs
    yarn dev > logs/frontend-auth.log 2>&1
  else
    yarn dev
  fi
else
  echo "Starting all frontend services in Docker..."
  docker compose up -d --wait --build
fi
