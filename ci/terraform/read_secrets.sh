#!/bin/bash
set -euo pipefail

ENVIRONMENT="${1}"

if [ "$ENVIRONMENT" = "dev" ]; then
  ENVIRONMENT="build"
fi

secrets="$(
  aws secretsmanager list-secrets \
    --filter "Key=\"name\",Values=\"/deploy/${ENVIRONMENT}/\"" --region eu-west-2 |
    jq -r '.SecretList[]|[.ARN,(.Name|split("/")|last)]|@tsv'
)"

while IFS=$'\t' read -r arn name; do
  value=$(aws secretsmanager get-secret-value --secret-id "${arn}" | jq -r '.SecretString')
  export "TF_VAR_${name}"="${value}"
done <<<"${secrets}"

if [ "$TF_VAR_basic_auth_password" = "none" ]; then
  export TF_VAR_basic_auth_username=""
  export TF_VAR_basic_auth_password=""
fi
