#!/usr/bin/env bash
set -eu

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

CLEAN=0
LOCAL=0

function usage() {
  local error_message="${1}"
  echo
  if [ -n "${error_message}" ]; then
    echo "Error: ${error_message}" >&2
  fi
  echo "Usage: startup.sh [-c] [-l]" >&2
  echo "  -c: Clean dist and node_modules" >&2
  echo "  -l: Start frontend natively (not in docker)" >&2
  exit 1
}

while getopts ":cl" opt; do
  case ${opt} in
  l)
    LOCAL=1
    ;;
  c)
    CLEAN=1
    ;;
  *)
    usage "Invalid option: -${OPTARG}"
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
docker-compose --log-level ERROR down

test -f .env || usage "Missing .env file"

export "$(grep -v '^#' .env | xargs)"

# shellcheck source=./scripts/export_aws_creds.sh
source "${DIR}/scripts/export_aws_creds.sh"

if [ $LOCAL == "1" ]; then
  echo "Starting frontend local service..."
  docker compose -f "docker-compose.yml" up -d --wait --no-deps redis di-auth-stub-default di-auth-stub-no-mfa
  export REDIS_PORT=6389
  export REDIS_HOST=localhost
  yarn install && yarn copy-assets && yarn dev
else
  echo "Starting frontend service..."
  docker compose up -d --wait --build
fi
