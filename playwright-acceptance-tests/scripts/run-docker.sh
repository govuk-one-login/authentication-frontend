#!/usr/bin/env bash
set -euo pipefail

ENV_NAME="${1:-stub}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
REPORTS_DIR="${PROJECT_DIR}/reports"

mkdir -p "${REPORTS_DIR}"

if [ "${ENV_NAME}" = "stub" ]; then
  echo "Running tests against local imposter stub via docker compose..."
  cd "${PROJECT_DIR}"
  docker compose up --build --abort-on-container-exit --exit-code-from test-runner
  EXIT_CODE=$?
  docker compose down
  exit $EXIT_CODE
fi

if [ "${ENV_NAME}" = "dev" ]; then
  BASE_URL="https://orchstub.signin.dev.account.gov.uk/"
  IMAGE_NAME="pw-acceptance-tests"
  ENV_FILE=".env"

  echo "Running docker tests against ${ENV_NAME}"
  echo "BASE_URL=${BASE_URL}"

  docker build -t "${IMAGE_NAME}" "${PROJECT_DIR}"

  ENV_FILE_ARG=()
  if [ -f "${PROJECT_DIR}/${ENV_FILE}" ]; then
    ENV_FILE_ARG=(--env-file "${PROJECT_DIR}/${ENV_FILE}")
  fi

  docker run --rm \
    "${ENV_FILE_ARG[@]}" \
    -e BASE_URL="${BASE_URL}" \
    -v "${REPORTS_DIR}:/app/reports" \
    "${IMAGE_NAME}"
  exit $?
fi

echo "Invalid environment: ${ENV_NAME}"
echo "Supported: stub, dev"
exit 1
