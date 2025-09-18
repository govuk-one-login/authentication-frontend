#!/usr/bin/env bash
set -eu

CLEAN=0
LOCAL=0
while getopts "c" opt; do
  case ${opt} in
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

pre-commit run --all-files

./startup.sh

npm run test:unit

REDIS_PORT=6379 REDIS_HOST=localhost npm run test:integration

./shutdown.sh
