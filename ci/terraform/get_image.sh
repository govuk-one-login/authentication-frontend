#!/usr/bin/env bash

set -euo pipefail

GITHUB_SHA=$1
REGISTRY_ID=114407264696
FRONTEND_REPO_NAME=frontend-image-repository
SIDECAR_REPO_NAME=basic-auth-sidecar-image-repository

echo "Loading frontend image..."

frontend_image=$(aws ecr batch-get-image \
  --repository-name $FRONTEND_REPO_NAME \
  --image-ids "imageTag=${GITHUB_SHA}" \
  --registry-id $REGISTRY_ID \
  --region eu-west-2 \
  --output text \
  --query 'images[0].imageId.imageDigest')

echo "Loading sidecar image..."

sidecar_image=$(aws ecr batch-get-image \
  --repository-name $SIDECAR_REPO_NAME \
  --image-ids "imageTag=${GITHUB_SHA}" \
  --registry-id $REGISTRY_ID \
  --region eu-west-2 \
  --output text \
  --query 'images[0].imageId.imageDigest')

echo "Exporting env variables..."

export TF_VAR_image_uri="$REGISTRY_ID.dkr.ecr.eu-west-2.amazonaws.com/$FRONTEND_REPO_NAME"
export TF_VAR_image_digest=$frontend_image
export TF_VAR_image_tag=$GITHUB_SHA

export TF_VAR_sidecar_image_uri="$REGISTRY_ID.dkr.ecr.eu-west-2.amazonaws.com/$SIDECAR_REPO_NAME"
export TF_VAR_sidecar_image_digest=$sidecar_image
export TF_VAR_sidecar_image_tag=$GITHUB_SHA
