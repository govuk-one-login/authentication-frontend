#!/usr/bin/env bash

set -eu
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
REPO_NAME="frontend-image-repository"
REPO_URL="706615647326.dkr.ecr.eu-west-2.amazonaws.com/frontend-image-repository"
IMAGE_TAG=latest

envvalue=("authdev1" "authdev2")

select word in "${envvalue[@]}"; do
  if [[ -z "$word" ]]; then
    printf '"%s" is not a valid choice\n' "$REPLY" >&2
  else
    user_in="$((REPLY - 1))"
    break
  fi
done

for ((i = 0; i < ${#envvalue[@]}; ++i)); do
  if ((i == user_in)); then
    printf 'You picked "%s"\n' "${envvalue[$i]}"
    export env=${envvalue[$i]}
    printf "deploying in enviorment %s\n" "$env"
    read -r -p "Press enter to continue or ctr c to abort"
  fi
done

function usage() {
  cat <<USAGE
  A script to deploy the GOV.UK Sign in APIs to the $env environment.
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

if [[ $# == 0 ]] || [[ $* == "-p" ]]; then
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

echo "Generating temporary ECR credentials..."
#Add you Tools DEV account Profile if diffrent name in below command
aws ecr get-login-password --region eu-west-2 --profile di-tools-dev | docker login --username AWS --password-stdin "${REPO_URL}"

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
  echo -n "Getting AWS credentials ... "
  ###Export The di-Auth-devlopment account profile below
  export AWS_PROFILE=di-auth-dev
  echo "done!"

  echo "Running Terraform..."
  pushd "${DIR}/ci/terraform" >/dev/null
  rm -rf .terraform/
  terraform init -backend-config="$env".hcl
  terraform apply ${TERRAFORM_OPTS} -var-file "$env".tfvars -var "image_uri=${REPO_URL}" -var "image_digest=${IMAGE_DIGEST}"

  if [[ $TERRAFORM_OPTS != "-destroy" ]]; then
    echo -n "Waiting for ECS deployment to complete ... "
    aws ecs wait services-stable --services "$env-frontend-ecs-service" --cluster "$env-app-cluster"
    echo "done!"
  fi

  popd >/dev/null
fi

echo "Deployment complete!"
