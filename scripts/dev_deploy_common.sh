#!/usr/bin/env bash
set -euo pipefail

[[ "${BASH_SOURCE[0]}" != "${0}" ]] || {
    echo "Error: Script must be sourced, not executed"
    exit 1
}

IMAGE_TAG=latest

REPO_NAME="frontend-image-repository"
REPO_URL="706615647326.dkr.ecr.eu-west-2.amazonaws.com/frontend-image-repository"

SIDECAR_REPO_NAME="basic-auth-sidecar-image-repository"
SIDECAR_REPO_URL="706615647326.dkr.ecr.eu-west-2.amazonaws.com/basic-auth-sidecar-image-repository"
BASIC_AUTH_USERNAME="${BASIC_AUTH_USERNAME:-testuser}"
BASIC_AUTH_PASSWORD="${BASIC_AUTH_PASSWORD:-testpassword}"
BASIC_AUTH_BYPASS_CIDR_BLOCKS="${BASIC_AUTH_BYPASS_CIDR_BLOCKS:-[]}"

function usage() {
    cat <<USAGE
  A script to deploy the GOV.UK Sign in APIs to the dev environment.
  Requires a GDS CLI, AWS CLI and jq installed and configured.

  Usage:
    $0 [-b|--build] [-t|--terraform] [--destroy] [-p|--prompt]

  Options:
    -b, --build               run docker build and push new version (default)
    -s, --sidecar             run docker build and push new sidecar version
    -t, --terraform           run terraform to deploy changes (default)
    --destroy                 run terraform with the -destroy flag (destroys all managed resources)
    -p, --prompt              will prompt for plan review before applying any terraform

    If no options specified the default actions above will be carried out without prompting.
USAGE
}

BUILD=0
SIDECAR=0
TERRAFORM=0
TERRAFORM_OPTS=("-auto-approve")
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
        TERRAFORM_OPTS=("-destroy")
        ;;
    -p | --prompt)
        TERRAFORM_OPTS=()
        ;;
    -s | --sidecar)
        SIDECAR=1
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
    echo "Building frontend image..."
    docker buildx build --platform=linux/amd64 --file sandpit.Dockerfile \
        -t "${REPO_NAME}:latest" \
        -t "${REPO_URL}:${IMAGE_TAG}" \
        .

    echo "Pushing frontend image..."
    docker push "${REPO_URL}:${IMAGE_TAG}"
    echo "Complete"

    if [[ "${SIDECAR}" == "1" ]]; then
        echo "Building sidecar image..."
        docker buildx build --platform=linux/amd64 \
            -t "${SIDECAR_REPO_NAME}:latest" \
            -t "${SIDECAR_REPO_URL}:${IMAGE_TAG}" \
            basic-auth-sidecar

        echo "Pushing sidecar image..."
        docker push "${SIDECAR_REPO_URL}:${IMAGE_TAG}"
        echo "Complete"
    fi
else
    docker pull "${REPO_URL}:${IMAGE_TAG}"
    [[ "${SIDECAR}" == "1" ]] && docker pull "${SIDECAR_REPO_URL}:${IMAGE_TAG}"
fi

IMAGE_DIGEST="$(docker inspect "${REPO_URL}:${IMAGE_TAG}" | jq -r '.[0].RepoDigests[0] | split("@") | .[1]')"
[[ "${SIDECAR}" == "1" ]] && SIDECAR_IMAGE_DIGEST="$(docker inspect "${SIDECAR_REPO_URL}:${IMAGE_TAG}" | jq -r '.[].RepoDigests[0] | split("@") | .[1]')"

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
    TERRAFORM_OPTS+=("-var-file" "${DEPLOY_ENV}.tfvars" "-var" "image_uri=${REPO_URL}" "-var" "image_digest=${IMAGE_DIGEST}")
    [[ "${SIDECAR}" == "1" ]] &&
        TERRAFORM_OPTS+=(
            "-var" "sidecar_image_uri=${SIDECAR_REPO_URL}"
            "-var" "sidecar_image_digest=${SIDECAR_IMAGE_DIGEST}"
            "-var" "basic_auth_username=${BASIC_AUTH_USERNAME}"
            "-var" "basic_auth_password=${BASIC_AUTH_PASSWORD}"
            "-var" "basic_auth_bypass_cidr_blocks=${BASIC_AUTH_BYPASS_CIDR_BLOCKS:-[]}")

    terraform apply "${TERRAFORM_OPTS[@]}"

    if [[ "${TERRAFORM_OPTS[1]}" != "-destroy" ]]; then
        echo -n "Waiting for ECS deployment to complete ... "
        aws ecs wait services-stable --services "${DEPLOY_ENV}-frontend-ecs-service" --cluster "${DEPLOY_ENV}-app-cluster"
        echo "done!"
    fi
    popd >/dev/null
fi

[[ "${SIDECAR}" == "1" ]] && echo "Basic auth credentials: testuser/testpassword"

echo "Deployment complete!"
