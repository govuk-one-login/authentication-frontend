#!/usr/bin/env bash
set -eu

CLEAN=0
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
fi

running_count=$(docker ps --filter status=running | grep "di-auth-frontend-dev" | wc -l | awk '{ print $1 }')
if [ ${running_count} -ne 0 ]; then
  echo "Stopping di-auth-frontend-dev..."
  docker stop di-auth-frontend-dev
  docker rm di-auth-frontend-dev --force
fi

echo "Starting di-auth-frontend-dev in frontend..."
docker run --name di-auth-frontend-dev -dp 3000:3000 -w /app -v "$(pwd):/app"  node:15-alpine sh -c "yarn install && yarn run copy-build && yarn run dev"
