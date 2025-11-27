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
  echo "  -L: Start frontend natively (not in docker) with local running backend" >&2
  echo "  -x: Only start dependencies (redis, stubs)" >&2
  exit 1
}

while getopts ":clLx" opt; do
  case ${opt} in
  l)
    ACTION_LOCAL=1
    ;;
  L)
    ACTION_FULL_LOCAL=1
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
shift $((OPTIND - 1))

if [ "${ACTION_LOCAL:-0}" == "1" ] && [ "${ACTION_DEPS_ONLY:-0}" == "1" ]; then
  usage "Cannot use -l and -x together"
fi

if [ ${#} -gt 0 ]; then
  usage "No extra arguments allowed. Got: ${*}"
fi

if [ "${ACTION_LOCAL:-0}" == "0" ] && [ "${ACTION_FULL_LOCAL:-0}" == "0" ]; then
  echo "WARNING: Running frontend in docker. This CAN be a bit flaky. If you encounter issues, try running natively with \`startup.sh -l\`"
  for ((n = 0; n < 3; n++)); do
    echo -n "."
    sleep 1
  done
  echo
fi

if [ "${ACTION_CLEAN:-0}" == "1" ]; then
  echo "Cleaning dist and node_modules..."
  rm -rf dist
  rm -rf node_modules
  rm -rf logs
fi

"${DIR}"/shutdown.sh

if [ "${ACTION_FULL_LOCAL:-0}" == "1" ]; then
  test -f .env.local || usage "Missing .env.local file"
else
  test -f .env || usage "Missing .env file"
fi



# shellcheck source=/dev/null
if [ "${ACTION_FULL_LOCAL:-0}" == "1" ]; then
  echo "exporting env vars from .env.local"
  set -o allexport && source .env.local && set +o allexport
else
  echo "exporting env vars from .env"
  set -o allexport && source .env && set +o allexport
fi

# shellcheck source=./scripts/export_aws_creds.sh
#source "${DIR}/scripts/export_aws_creds.sh"

#unset AWS_PROFILE

if [ "${ACTION_LOCAL:-0}" == "1" ]; then
  echo "Starting frontend local service..."
  docker compose -f docker-compose.yml up --build -d --wait
  export REDIS_PORT=${REDIS_PORT:-6379}
  export REDIS_HOST=localhost
  echo "Redis listening on redis://localhost:${REDIS_PORT:-6379}"
  if [ "${ACTION_DEPS_ONLY:-0}" == "0" ]; then
    export PORT="${DOCKER_FRONTEND_PORT:-3000}"
    yarn install && yarn test:dev-evironment-variables && yarn copy-assets && yarn dev
  else
    docker compose -f docker-compose.yml logs -f
  fi
elif [ "${ACTION_FULL_LOCAL:-0}" == "1" ]; then
  echo "Starting frontend local service and backend local service..."
  (
    cd "${DIR}"
    cd ..
    cd authentication-api/local-running
    docker compose up --build -d authentication-api orchestration-stub
  )
  echo "Will listen on redis port ${REDIS_PORT:-6380}"
  docker compose -f docker-compose.yml up --build -d --wait
  export REDIS_PORT=${REDIS_PORT:-6380}
  export REDIS_HOST=localhost
  echo "Redis listening on redis://localhost:${REDIS_PORT:-6379}"
  export PORT="${DOCKER_FRONTEND_PORT:-3000}"
  yarn install && yarn copy-assets && yarn dev
else
  echo "Starting frontend service..."
  docker compose -f docker-compose.yml -f docker-compose.frontend.yml up -d --wait --build
  echo "Redis listening on redis://localhost:${REDIS_PORT:-6379}"
  echo "Frontend listening on http://localhost:${DOCKER_FRONTEND_PORT:-3000}"
  echo "Frontend nodemon listening on localhost:${DOCKER_FRONTEND_NODEMON_PORT:-9230}"
  docker compose -f docker-compose.yml -f docker-compose.frontend.yml logs -f
fi
