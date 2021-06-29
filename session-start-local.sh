#!/usr/bin/env bash
set -eu

set -o allexport
source .env
set +o allexport

export REDIRECT_REQUEST="authorize?response_type=code&redirect_uri=https%3A%2F%2Fdi-auth-stub-relying-party-build.london.cloudapps.digital%2Foidc%2Fcallback&state=c-dGmn5O5g0ZTu6hoId4kR2dhE9wq5DMdqBNDCZk_DA&client_id=test-id&scope=openid+profile+email"

redirect=$(curl -Ls -o /dev/null -w %{url_effective} $API_BASE_URL/$REDIRECT_REQUEST)

echo $redirect

query_params="$(cut -d'?' -f2 <<<"$redirect")"
open "http://localhost:3000/?$query_params"