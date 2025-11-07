#!/usr/bin/env bash
set -euo pipefail

[[ "${BASH_SOURCE[0]}" != "${0}" ]] || {
    echo "Error: Script must be sourced, not executed"
    exit 1
}

REPO_NAME="frontend-image-repository"
REPO_URL="706615647326.dkr.ecr.eu-west-2.amazonaws.com/frontend-image-repository"
IMAGE_TAG=latest

function usage() {
    cat <<USAGE
  A script to deploy the GOV.UK Sign in APIs to the dev environment.
  Requires a GDS CLI, AWS CLI and jq installed and configured.

  Usage:
    $0 [-b|--build]

  Options:
    -b, --build               run docker build and push new version (default)

    If no options specified the default actions above will be carried out without prompting.
USAGE
}

BUILD=0
if [[ $# == 0 ]]; then
    BUILD=1
fi
while [[ $# -gt 0 ]]; do
    case $1 in
    -b | --build)
        BUILD=1
        ;;

    *)
        usage
        exit 1
        ;;
    esac
    shift
done

export AWS_PROFILE="digital-identity-tools-dev-admin"

# shellcheck source=./scripts/export_aws_creds.sh
source "${DIR}/scripts/export_aws_creds.sh"

echo "Generating temporary ECR credentials..."
aws ecr get-login-password --region eu-west-2 |
    docker login --username AWS --password-stdin "${REPO_URL}"

if [[ $BUILD == "1" ]]; then
    echo "Building image..."
    docker buildx build --platform=linux/amd64 --file dev.Dockerfile -t "${REPO_NAME}" .
    echo "Tagging image..."
    docker tag "${REPO_NAME}:latest" "${REPO_URL}:${IMAGE_TAG}"

    echo "Pushing image..."
    docker push "${REPO_URL}:${IMAGE_TAG}"
    IMAGE_DIGEST="$(docker inspect "${REPO_URL}:${IMAGE_TAG}" | jq -r '.[0].RepoDigests[0] | split("@") | .[1]')"
    echo "Digest = ${IMAGE_DIGEST}"
    echo "Complete"
else
    # Adding --platform=linux/amd64 to ensure the image is pulled for the correct architecture
    # This is required for the buildx build command to work on M1 Macs
    echo "Pulling image..."
    docker pull --platform=linux/amd64 "${REPO_URL}:${IMAGE_TAG}"
    IMAGE_DIGEST="$(docker inspect "${REPO_URL}:${IMAGE_TAG}" | jq -r '.[0].RepoDigests[0] | split("@") | .[1]')"
fi



echo "Deployment complete!"
