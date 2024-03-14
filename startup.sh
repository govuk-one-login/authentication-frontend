#!/usr/bin/env bash
set -eu

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

function usage() {
  local error_message="${1}"
  echo
  if [ -n "${error_message}" ]; then
    echo "Error: ${error_message}" >&2
  fi
  echo "Usage: startup.sh [-c] [-l]" >&2
  echo "  -c: Clean dist and node_modules" >&2
  echo "  -l: Start frontend natively (not in docker)" >&2
  echo "  -x: Only start dependencies (redis, stubs)" >&2
  exit 1
}

while getopts ":clx" opt; do
  case ${opt} in
  l)
    ACTION_LOCAL=1
    ;;
  c)
    ACTION_CLEAN=1
    ;;
  x)
    ACTION_DEPS_ONLY=1
    ;;
  *)
    usage "Invalid option: -${OPTARG}"
    ;;
  esac
done

if [ "${ACTION_CLEAN:-0}" == "1" ]; then
  echo "Cleaning dist and node_modules..."
  rm -rf dist
  rm -rf node_modules
  rm -rf logs
fi

"${DIR}"/shutdown.sh

test -f .env || usage "Missing .env file"

# set shellcheck source to .env.build, as this is a 'complete' example
# shellcheck source=.env.build
set -o allexport && source .env && set +o allexport

# shellcheck source=./scripts/export_aws_creds.sh
source "${DIR}/scripts/export_aws_creds.sh"

if [ "${ACTION_LOCAL:-0}" == "1" ]; then
  echo "Starting frontend local service..."
  docker compose -f docker-compose.yml up --build -d --wait
  echo "No-MFA stub listening on http://localhost:${DOCKER_STUB_NO_MFA_PORT:-5000}"
  echo "Default stub listening on http://localhost:${DOCKER_STUB_DEFAULT_PORT:-2000}"
  echo "Redis listening on redis://localhost:${DOCKER_REDIS_PORT:-6379}"
  export REDIS_PORT=${DOCKER_REDIS_PORT:-6379}
  export REDIS_HOST=localhost
  if [ "${ACTION_DEPS_ONLY:-0}" == "0" ]; then
    export PORT="${DOCKER_FRONTEND_PORT:-3000}"
    yarn install && yarn test:dev-evironment-variables && yarn copy-assets && yarn dev
  else
    docker compose -f docker-compose.yml logs -f
  fi
else
  echo "Starting frontend service..."
  docker compose -f docker-compose.yml -f docker-compose.frontend.yml up -d --wait --build
  echo "No-MFA stub listening on http://localhost:${DOCKER_STUB_NO_MFA_PORT:-5000}"
  echo "Default stub listening on http://localhost:${DOCKER_STUB_DEFAULT_PORT:-2000}"
  echo "Redis listening on redis://localhost:${DOCKER_REDIS_PORT:-6379}"
  echo "Frontend listening on http://localhost:${DOCKER_FRONTEND_PORT:-3000}"
  echo "Frontend nodemon listening on localhost:${DOCKER_FRONTEND_NODEMON_PORT:-9230}"
fi
