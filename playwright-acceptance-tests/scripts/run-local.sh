#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ORCH_STUB_DIR="${PROJECT_DIR}/../../authentication-stubs/orchestration-stub"

if [ ! -d "${ORCH_STUB_DIR}" ]; then
  echo "Error: orchestration-stub not found at ${ORCH_STUB_DIR}" >&2
  echo "Clone authentication-stubs into the parent directory to run locally." >&2
  exit 1
fi

echo "Building orch-stub from ${ORCH_STUB_DIR}..."
docker build -t orch-stub-local "${ORCH_STUB_DIR}"

echo "Running acceptance tests..."
cd "${PROJECT_DIR}"
ORCH_STUB_IMAGE=orch-stub-local docker compose up --build --abort-on-container-exit --exit-code-from test-runner
EXIT_CODE=$?
ORCH_STUB_IMAGE=orch-stub-local docker compose down
exit $EXIT_CODE
