#!/usr/bin/env bash
set -eu

set -o allexport
source .env
set +o allexport

redirect=$(curl -Ls -o /dev/null -w %{url_effective} $API_BASE_URL/authorize\?response_type\=code\&redirect_uri\=http%3A%2F%2Flocalhost%3A8080\&state\=T7HEWmyE8GS2LCClCgFzAEuESAtC5p2tf00Te_O5-4w\&client_id\=test-id\&client_name\=client-name\&scope\=openid+profile+email)

query_params="$(cut -d'?' -f2 <<<"$redirect")"

open "http://localhost:3000/?$query_params"