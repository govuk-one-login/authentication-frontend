#!/usr/bin/env bash
set -euo pipefail

echo "Stopping frontend services..."

TMPDIR=${TMPDIR:-/tmp}
tmp_env=$(mktemp "${TMPDIR}/frontend-dummy-env.XXXXXX")
trap 'rm -f "${tmp_env}"' EXIT

# Collect all required env vars from docker-compose.yml
required_vars=$(grep "\${" docker-compose.yml | sed "s/.*\${\([A-Z_]*\)[:\}].*/\1=asdf/g" | sort | uniq)
required_vars_frontend=$(grep "\${" docker-compose.frontend.yml | sed "s/.*\${\([A-Z_]*\)[:\}].*/\1=asdf/g" | sort | uniq)
# shellcheck disable=SC2016
# Replace all required env vars with dummy values (integer between 2000 and 65000, so they are valid ports)
printf '%s\n%s' "${required_vars}" "${required_vars_frontend}" | sort | uniq | xargs -L1 -I{} bash -c 'echo "{}" | sed "s/asdf/$(jot -r 1 2000 65000)/"' >"${tmp_env}"
docker-compose --env-file="${tmp_env}" -f docker-compose.yml -f docker-compose.frontend.yml down
killall node 2>/dev/null || echo "No local running node processes stopped..."
