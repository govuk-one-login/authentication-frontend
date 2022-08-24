#!/usr/bin/env bash
set -eu

CLEAN=0
LOCAL=0
while getopts "cl" opt; do
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
fi

echo "Stopping frontend services..."
docker-compose down

echo "Starting frontend service..."
docker-compose up --build
