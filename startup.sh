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

"${DIR}"/shutdown.sh

test -f .env || usage "Missing .env file"

# shellcheck source=/dev/null
set -o allexport && source .env && set +o allexport

# shellcheck source=./scripts/export_aws_creds.sh
source "${DIR}/scripts/export_aws_creds.sh"

if [ $LOCAL == "1" ]; then
  echo "Starting frontend local service..."
  docker compose -f docker-compose.yml up --build -d --wait
  echo "No-MFA stub listening on http://localhost:${DOCKER_STUB_NO_MFA_PORT}"
  echo "Default stub listening on http://localhost:${DOCKER_STUB_DEFAULT_PORT}"
  echo "Redis listening on redis://localhost:${DOCKER_REDIS_PORT:-6379}"
  export REDIS_PORT=${DOCKER_REDIS_PORT:-6379}
  export REDIS_HOST=localhost
  export PORT="${DOCKER_FRONTEND_PORT}"
  yarn install && yarn test:dev-evironment-variables && yarn copy-assets && yarn dev
else
  echo "Starting frontend service..."
  docker compose -f docker-compose.yml -f docker-compose.frontend.yml up -d --wait --build
  echo "No-MFA stub listening on http://localhost:${DOCKER_STUB_NO_MFA_PORT}"
  echo "Default stub listening on http://localhost:${DOCKER_STUB_DEFAULT_PORT}"
  echo "Redis listening on redis://localhost:${DOCKER_REDIS_PORT}"
  echo "Frontend listening on http://localhost:${DOCKER_FRONTEND_PORT}"
  echo "Frontend nodemon listening on localhost:${DOCKER_FRONTEND_NODEMON_PORT}"
fi
