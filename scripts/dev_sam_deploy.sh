#!/usr/bin/env bash
set -euo pipefail

[[ "${BASH_SOURCE[0]}" != "${0}" ]] || {
    echo "Error: Script must be sourced, not executed"
    exit 1
}

function usage() {
    cat <<USAGE
  A script to deploy the GOV.UK Sign in Frontend to the dev environment.
  Requires a GDS CLI, AWS CLI and jq installed and configured.

  Usage:
    $0 [-b|--build] [-d|--deploy] [--destroy] [-p|--prompt]

  Options:
    -b, --build               run docker build and push new version (default)
    -d, --deploy              deploy the AWS SAM application (default)
    --destroy                 delete the AWS SAM application and the artifacts created by sam deploy
    -p, --prompt              will prompt for view changelog before applying

    If no options specified the default actions above will be carried out without prompting.
USAGE
}

BUILD=0
CONFIRM_CHANGESET_OPTION="--no-confirm-changeset"
DEPLOY=0
DELETE=0

# If no options specified the default actions above will be carried out without prompting.
if [[ $# == 0 ]]; then
    BUILD=1
    DEPLOY=1
    echo "Deploying to $DEPLOY_ENV with default options ($0 --build --deploy)"
fi

while [[ $# -gt 0 ]]; do
    case "${1}" in
    -b | --build)
        BUILD=1
        ;;
    -d | --deploy | -t | --terraform)
        # -t|--terraform kept there for now, because old habits die hard
        DEPLOY=1
        ;;
    --destroy)
        DELETE=1
        ;;
    -p | --prompt)
        CONFIRM_CHANGESET_OPTION="--confirm-changeset"
        ;;
    *)
        usage
        exit 1
        ;;
    esac
    shift
done

# -------------------------
# deployment configurations
# -------------------------
ECR_REGISTRY="975050272416.dkr.ecr.eu-west-2.amazonaws.com"
ECR_REPO_NAME=""
case $DEPLOY_ENV in
    authdev1) ECR_REPO_NAME="authdev1-frontend-image-repository-containerrepository-k0a7zjnydazf" ;;
    authdev2) ECR_REPO_NAME="authdev2-frontend-image-repository-containerrepository-lvjd0pm7fkxh" ;;
    *)
        echo "Unrecognized deploy env: $DEPLOY_ENV"
        exit 1
        ;;
esac
DOCKER_BUILD_PATH="${DOCKER_BUILD_PATH:-.}"
DOCKERFILE="${DOCKERFILE:-sandpit.Dockerfile}"
DOCKER_PLATFORM="${DOCKER_PLATFORM:-linux/amd64}"
GITHUB_SHA="$(git rev-parse HEAD)"
PUSH_LATEST_TAG="${PUSH_LATEST_TAG:-false}"
TEMPLATE_FILE="${TEMPLATE_FILE:-cloudformation/deploy/template.yaml}"
TAGS_FILE="${TAGS_FILE:-scripts/dev_deploy_tags.json}"
SAMCONFIG_FILE=${SAMCONFIG_FILE:-scripts/dev_deploy_samconfig.toml}
RESOURCES_TO_RETAIN=${RESOURCES_TO_RETAIN:-AccessLogsBucket}

# -----------------------
# login to target account
# -----------------------
export AWS_PROFILE="di-authentication-development-admin"

# shellcheck source=./scripts/export_aws_creds.sh
source "${DIR}/scripts/export_aws_creds.sh"

echo "Generating temporary ECR credentials..."
aws configure set region eu-west-2
aws ecr get-login-password --region eu-west-2 |
    docker login --username AWS --password-stdin "${ECR_REGISTRY}"

# ---------------------
# Build SAM application
# ---------------------
if [[ $BUILD == "1" ]]; then
    echo "Building image"

    PLATFORM_OPTION="--platform ${DOCKER_PLATFORM}"
    TAG_OPTION=""
    if [ "$PUSH_LATEST_TAG" == "true" ]; then
        echo "Tagging option supplied $ECR_REGISTRY/$ECR_REPO_NAME:latest"
        TAG_OPTION="--tag $ECR_REGISTRY/$ECR_REPO_NAME:latest"
    fi

    # shellcheck disable=SC2086
    docker build \
        --tag "$ECR_REGISTRY/$ECR_REPO_NAME:$GITHUB_SHA" \
        $TAG_OPTION \
        $PLATFORM_OPTION \
        --file "$DOCKER_BUILD_PATH"/"$DOCKERFILE" \
        "$DOCKER_BUILD_PATH"

    docker push "$ECR_REGISTRY/$ECR_REPO_NAME:$GITHUB_SHA"
    if [ "$PUSH_LATEST_TAG" == "true" ]; then
        docker push "$ECR_REGISTRY/$ECR_REPO_NAME:latest"
    fi
fi

# ----------------------
# Deploy SAM application
# ----------------------
if [[ $DEPLOY == "1" ]]; then
    echo "Running sam build on template file"
    sam build --template-file="$TEMPLATE_FILE"
    mv .aws-sam/build/template.yaml cf-template.yaml

    if grep -q "CONTAINER-IMAGE-PLACEHOLDER" cf-template.yaml; then
        echo "Replacing \"CONTAINER-IMAGE-PLACEHOLDER\" with new ECR image ref"
        sed -i.bak "s|CONTAINER-IMAGE-PLACEHOLDER|$ECR_REGISTRY/$ECR_REPO_NAME:$GITHUB_SHA|" cf-template.yaml
    else
        echo "WARNING!!! Image placeholder text \"CONTAINER-IMAGE-PLACEHOLDER\" not found - uploading template anyway"
    fi

    if grep -q "GIT-SHA-PLACEHOLDER" cf-template.yaml; then
        echo "Replacing \"GIT-SHA-PLACEHOLDER\" with new ECR image tag"
        sed -i.bak "s|GIT-SHA-PLACEHOLDER|$GITHUB_SHA|" cf-template.yaml
    fi

    echo "Deploying SAM application"
    TAGS=$(jq '.[] | "\(.Key)=\(.Value)"' -r "$TAGS_FILE")

    # shellcheck disable=SC2086
    sam deploy \
        --template-file cf-template.yaml \
        --config-env "$DEPLOY_ENV" \
        --config-file "$SAMCONFIG_FILE" \
        $CONFIRM_CHANGESET_OPTION \
        --tags $TAGS Product="GOV.UK Sign In" commitsha=${GITHUB_SHA}

    # cleanup
    rm cf-template.yaml*

    echo "Deployment complete!"
fi

# ------------------
# Delete application
# ------------------
if [[ $DELETE == "1" ]]; then
    stack_name="${DEPLOY_ENV}-frontend"

    while true; do
        read -rp "Delete ${stack_name}? [y/N] " delete_response
        case $delete_response in
            [yY]) break;;
            [nN]) echo "Aborting delete"; exit 0;;
            *) echo "invalid response, please use Y/y or N/n";;
        esac
    done

    while true; do
        stack_state="$(aws cloudformation describe-stacks --stack-name "${stack_name}" \
        --query "Stacks[0].StackStatus" --output text 2>/dev/null || echo "NO_STACK")"
        case $stack_state in
            NO_STACK) break;;
            DELETE_COMPLETE) break;;
            DELETE_FAILED)
                echo "Retaining resource $RESOURCES_TO_RETAIN"
                aws cloudformation delete-stack --stack-name "${stack_name}" --retain-resources "$RESOURCES_TO_RETAIN"
                aws cloudformation wait stack-delete-complete --stack-name "${stack_name}"
                ;;
            DELETE_IN_PROGRESS) echo -n ".";;
            *)
                echo "Deleting ${stack_name}..."
                aws cloudformation delete-stack --stack-name "${stack_name}"
                aws cloudformation wait stack-delete-complete --stack-name "${stack_name}" 2>/dev/null || true
                ;;
        esac
    done
    echo "Stack deleted!"
fi
