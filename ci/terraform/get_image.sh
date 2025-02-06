#!/usr/bin/env bash

set -euo pipefail

GITHUB_SHA="${1}"
ENVIRONMENT="${2}"
FRONTEND_REPO_NAME=frontend-image-repository
SERVICE_DOWN_REPO_NAME=service-down-page-image-repository

echo "Setting the ECR repo registry ID"
# If Enviorment is DEV  then pull image from tools-dev Dev account to deploy Dev frontend
# Else pull image from tools-prod to deploy  ( Build , integration , Staging & prod  ) frontend

if [ "$ENVIRONMENT" = "dev" ]; then
  REGISTRY_ID=$(aws ssm get-parameter --name "AUTH_DEV_TOOLS_ACT_ID" --with-decryption --query 'Parameter.Value' --output text)
else
  REGISTRY_ID=$(aws ssm get-parameter --name "AUTH_PROD_TOOLS_ACT_ID" --with-decryption --query 'Parameter.Value' --output text)
fi

echo "Loading frontend image..."

frontend_image=$(aws ecr batch-get-image \
  --repository-name $FRONTEND_REPO_NAME \
  --image-ids "imageTag=${GITHUB_SHA}" \
  --registry-id "$REGISTRY_ID" \
  --region eu-west-2 \
  --output text \
  --query 'images[0].imageId.imageDigest')

service_down_image=$(aws ecr batch-get-image \
  --repository-name $SERVICE_DOWN_REPO_NAME \
  --image-ids "imageTag=${GITHUB_SHA}" \
  --registry-id "$REGISTRY_ID" \
  --region eu-west-2 \
  --output text \
  --query 'images[0].imageId.imageDigest')

echo "Exporting env variables..."

export TF_VAR_image_uri="$REGISTRY_ID.dkr.ecr.eu-west-2.amazonaws.com/$FRONTEND_REPO_NAME"
export TF_VAR_image_digest=$frontend_image
export TF_VAR_image_tag=$GITHUB_SHA

export TF_VAR_service_down_image_uri="$REGISTRY_ID.dkr.ecr.eu-west-2.amazonaws.com/$SERVICE_DOWN_REPO_NAME"
export TF_VAR_service_down_image_digest=$service_down_image
export TF_VAR_service_down_image_tag=$GITHUB_SHA
