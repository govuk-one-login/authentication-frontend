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
    $0 [-b|--build] [-t|--terraform] [--destroy] [-p|--prompt]

  Options:
    -b, --build               run docker build and push new version (default)
    -t, --terraform           run terraform to deploy changes (default)
    --destroy                 run terraform with the -destroy flag (destroys all managed resources)
    -p, --prompt              will prompt for plan review before applying any terraform

    If no options specified the default actions above will be carried out without prompting.
USAGE
}

BUILD=0
TERRAFORM=0
TERRAFORM_OPTS="-auto-approve"
if [[ $# == 0 ]]; then
    BUILD=1
    TERRAFORM=1
fi
while [[ $# -gt 0 ]]; do
    case $1 in
    -b | --build)
        BUILD=1
        ;;
    -t | --terraform)
        # shellcheck disable=SC2034
        TERRAFORM=1
        ;;
    --destroy)
        TERRAFORM_OPTS="-destroy"
        ;;
    -p | --prompt)
        TERRAFORM_OPTS=""
        ;;
    *)
        usage
        exit 1
        ;;
    esac
    shift
done

DEPLOY_AWS_PROFILE="${AWS_PROFILE}"

export AWS_PROFILE="digital-identity-tools-dev-admin"

# shellcheck source=./scripts/export_aws_creds.sh
source "${DIR}/scripts/export_aws_creds.sh"

echo "Generating temporary ECR credentials..."
aws ecr get-login-password --region eu-west-2 |
    docker login --username AWS --password-stdin "${REPO_URL}"

if [[ $BUILD == "1" ]]; then
    echo "Building image..."
    docker buildx build --platform=linux/amd64 --file sandpit.Dockerfile -t "${REPO_NAME}" .
    echo "Tagging image..."
    docker tag "${REPO_NAME}:latest" "${REPO_URL}:${IMAGE_TAG}"

    echo "Pushing image..."
    docker push "${REPO_URL}:${IMAGE_TAG}"
    IMAGE_DIGEST="$(docker inspect "${REPO_URL}:${IMAGE_TAG}" | jq -r '.[0].RepoDigests[0] | split("@") | .[1]')"
    echo "Digest = ${IMAGE_DIGEST}"
    echo "Complete"
else
    docker pull "${REPO_URL}:${IMAGE_TAG}"
    IMAGE_DIGEST="$(docker inspect "${REPO_URL}:${IMAGE_TAG}" | jq -r '.[0].RepoDigests[0] | split("@") | .[1]')"
fi

if [[ $TERRAFORM == "1" ]]; then
    unset AWS_ACCESS_KEY_ID
    unset AWS_SECRET_ACCESS_KEY

    export AWS_PROFILE="${DEPLOY_AWS_PROFILE}"
    # shellcheck source=./scripts/export_aws_creds.sh
    source "${DIR}/scripts/export_aws_creds.sh"

    echo "Running Terraform..."
    pushd "${DIR}/ci/terraform" >/dev/null
    rm -rf .terraform/
    terraform init -backend-config="${DEPLOY_ENV}.hcl"
    terraform apply ${TERRAFORM_OPTS} -var-file "${DEPLOY_ENV}.tfvars" -var "image_uri=${REPO_URL}" -var "image_digest=${IMAGE_DIGEST}"

    if [[ $TERRAFORM_OPTS != "-destroy" ]]; then
        echo -n "Waiting for ECS deployment to complete ... "
        aws ecs wait services-stable --services "${DEPLOY_ENV}-frontend-ecs-service" --cluster "${DEPLOY_ENV}-app-cluster"
        echo "done!"
    fi
    popd >/dev/null
fi

echo "Deployment complete!"
