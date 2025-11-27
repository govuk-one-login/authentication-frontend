#!/bin/bash

set -e

# Parse command line arguments
while getopts ":c" opt; do
	case ${opt} in
	c)
		ACTION_CLEAN=1
		;;
	*)
		echo "Usage: $0 [-c]" >&2
		echo "  -c: Clean dist and node_modules" >&2
		exit 1
		;;
	esac
done
shift $((OPTIND - 1))

# Check for clean action
if [ "${ACTION_CLEAN:-0}" == "1" ]; then
	echo "Cleaning dist and node_modules..."
	rm -rf dist
	rm -rf node_modules
	rm -rf logs
fi

echo "Starting frontend..."

# Load environment variables
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
set -o allexport
# shellcheck disable=SC1091
source "${DIR}/.env"
set +o allexport

# Check if API Gateway proxy is running
if ! lsof -i :8888 >/dev/null 2>&1; then
	echo "API Gateway proxy not running on port 8888"
	echo "Please run: ./scripts/setup-apigateway-proxy.sh"
	exit 1
fi
echo "API Gateway proxy is running"

# Check and kill processes using frontend port
FRONTEND_PORT="${DOCKER_FRONTEND_PORT:-3000}"

echo "Checking for processes using port $FRONTEND_PORT..."
# shellcheck disable=SC2086
if lsof -ti :$FRONTEND_PORT >/dev/null 2>&1; then
	echo "Port $FRONTEND_PORT is in use. Killing existing processes..."
	# shellcheck disable=SC2086
	lsof -ti :$FRONTEND_PORT | xargs kill -9 2>/dev/null || true
	sleep 2
fi

# Start dependencies with Docker
echo "Starting dependencies (Redis, stubs)..."
docker compose -f docker-compose-proxy.yml up --build -d --wait redis di-auth-stub-orchstub service-down-page

# Install dependencies and start frontend
echo " Installing dependencies..."
npm ci
node node_modules/esbuild/install.js
npm run test:dev-evironment-variables && npm run copy-assets

echo "Starting frontend on http://localhost:${DOCKER_FRONTEND_PORT:-3000}"
echo ""
echo "Dependencies running:"
echo "  - Redis: localhost:${REDIS_PORT:-6379}"
echo "  - Orch stub: http://localhost:${DOCKER_STUB_ORCHSTUB_PORT:-3002}"
echo ""

# Start the frontend
export PORT="${DOCKER_FRONTEND_PORT:-3000}"
echo "To stop everything: Ctrl+C"
npm run dev
