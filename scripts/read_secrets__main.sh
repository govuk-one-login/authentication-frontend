set -euo pipefail

[[ "${BASH_SOURCE[0]}" != "${0}" ]] || {
  echo "Error: Script must be sourced, not executed"
  exit 1
}

ENVIRONMENT="${1}"

if [ "$ENVIRONMENT" = "dev" ]; then
  ENVIRONMENT="build"
fi

secrets="$(
  aws secretsmanager list-secrets \
    --filter "Key=\"name\",Values=\"/deploy/${ENVIRONMENT}/\"" --region eu-west-2 |
    jq -r '.SecretList[]|[.ARN,(.Name|split("/")|last)]|@tsv'
)"

if [ -z "${secrets}" ]; then
  printf '!! ERROR: No secrets found for environment %s. Exiting.\n' "${ENVIRONMENT}" >&2
  exit 1
fi

while IFS=$'\t' read -r arn name; do
  value=$(aws secretsmanager get-secret-value --secret-id "${arn}" | jq -r '.SecretString')
  export "TF_VAR_${name}"="${value}"
done <<<"${secrets}"

if [ "${TF_VAR_basic_auth_password:-}" = "none" ]; then
  export TF_VAR_basic_auth_username=""
  export TF_VAR_basic_auth_password=""
fi
