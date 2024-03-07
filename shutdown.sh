#!/usr/bin/env bash

echo "Stopping frontend services..."

TMPDIR=${TMPDIR:-/tmp}
tmp_env=$(mktemp "${TMPDIR}/frontend-dummy-env.XXXXXX")
trap 'rm -f "${tmp_env}"' EXIT

# Collect all required env vars from docker-compose.yml
required_vars=$(grep "\${" docker-compose.yml | sed "s/.*\${\([A-Z_]*\)[:\}].*/\1=asdf/g" | sort | uniq)
# shellcheck disable=SC2016
# Replace all required env vars with dummy values (integer between 2000 and 65000, so they are valid ports)
echo "${required_vars}" | xargs -L1 -I{} bash -c 'echo "{}" | sed "s/asdf/$(jot -r 1 2000 65000)/"' >"${tmp_env}"

docker-compose --env-file="${tmp_env}" down
killall node 2>/dev/null || echo "No local running node processes stopped..."
