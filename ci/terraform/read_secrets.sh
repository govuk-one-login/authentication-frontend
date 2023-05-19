#!/usr/bin/env bash

ENVIRONMENT=$1

if [ "$ENVIRONMENT" = "dev" ]; then
	ENVIRONMENT="build";
fi

secrets=$(aws secretsmanager list-secrets --filter Key="name",Values="/deploy/$ENVIRONMENT/" --region eu-west-2 | jq -c '.SecretList[]')

for i in $secrets; do
  arn=$(echo $i | jq -r '.ARN')
  name=$(echo $i | jq -r '.Name | split("/") | last')
  value=$(aws secretsmanager get-secret-value --region eu-west-2 --secret-id $arn | jq -r '.SecretString')
  VAR=(TF_VAR_$name=$value)
  export $VAR
done

if [ "$TF_VAR_basic_auth_password" = "none" ]; then
  export TF_VAR_basic_auth_username=""
  export TF_VAR_basic_auth_password=""
fi
