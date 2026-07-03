#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ORCH_STUB_DIR="${PROJECT_DIR}/../../authentication-stubs/orchestration-stub"

if [ ! -d "${ORCH_STUB_DIR}" ]; then
  echo "Error: orchestration-stub not found at ${ORCH_STUB_DIR}" >&2
  echo "Clone authentication-stubs as a sibling directory to authentication-frontend." >&2
  exit 1
fi

cd "${PROJECT_DIR}"
export ORCH_STUB_IMAGE=orch-stub-local

echo "Stopping any existing services..."
docker compose -f docker-compose.yml -f docker-compose.intellij.yml down --remove-orphans 2>/dev/null || true

echo "Building orch-stub from ${ORCH_STUB_DIR}..."
docker build -t orch-stub-local "${ORCH_STUB_DIR}"

echo "Starting services (without test-runner)..."
docker compose -f docker-compose.yml -f docker-compose.intellij.yml up --build -d proxy authentication-frontend api-stub orch-stub-start

echo ""
echo "========================================="
echo "Services are running:"
echo "  Orch stub:  http://localhost:4400"
echo "  API stub:   http://localhost:8080"
echo "========================================="
echo ""
echo "You can now run tests from IntelliJ."
echo ""
echo "To stop:"
echo "  cd $(pwd) && ORCH_STUB_IMAGE=orch-stub-local docker compose -f docker-compose.yml -f docker-compose.intellij.yml down"
