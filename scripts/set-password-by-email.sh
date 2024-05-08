#!/usr/bin/env bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

#Set the AWS_PROFILE for the environment in which you want to set the password
export AWS_PROFILE=""
#Set the credential table name for the environment (ex: authdev1-user-credentials)
table_name=""
#Set the account email and desired password for the account
email=""
password=""

# shellcheck source=./scripts/export_aws_creds.sh
source "${DIR}/export_aws_creds.sh"
hashed_pwd=$(echo -n "$password" | argon2 "$(openssl rand -hex 32)" -e -id -v 13 -k 15360 -t 2 -p 1 | cat -u)

export AWS_PAGER=""
echo "Trying to update the AWS dynamodb record:"
aws dynamodb update-item \
  --table-name "$table_name" \
  --key "{\"Email\":{\"S\":\"$email\"}}" \
  --update-expression "SET Password = :pw" \
  --expression-attribute-values "{\":pw\":{\"S\":\"$hashed_pwd\"}}" \
  --region "eu-west-2" \
  --return-values ALL_NEW
