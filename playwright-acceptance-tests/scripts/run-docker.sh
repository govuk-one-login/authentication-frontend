#!/usr/bin/env bash
set -euo pipefail

ENV_NAME="${1:-dev}"

IMAGE_NAME="pw-acceptance-tests"
ENV_FILE=".env"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
REPORTS_DIR="${PROJECT_DIR}/reports"

mkdir -p "${REPORTS_DIR}"

if [ "${ENV_NAME}" != "dev" ]; then
  echo "Invalid environment: ${ENV_NAME}"
  echo "This POC currently supports: dev"
  exit 1
fi

BASE_URL="https://orchstub.signin.dev.account.gov.uk/"

echo "Running docker tests"
echo "ENV_NAME=${ENV_NAME}"
echo "BASE_URL=${BASE_URL}"
echo "Project directory: ${PROJECT_DIR}"
echo "Reports will be saved to: ${REPORTS_DIR}"
echo ""

docker build -t "${IMAGE_NAME}" "${PROJECT_DIR}"

ENV_FILE_ARG=()
if [ -f "${PROJECT_DIR}/${ENV_FILE}" ]; then
  ENV_FILE_ARG=(--env-file "${PROJECT_DIR}/${ENV_FILE}")
else
  echo "No .env file found, continuing with only injected BASE_URL"
fi

docker run --rm \
  "${ENV_FILE_ARG[@]}" \
  -e BASE_URL="${BASE_URL}" \
  -v "${REPORTS_DIR}:/app/reports" \
  "${IMAGE_NAME}"
