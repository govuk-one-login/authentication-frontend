#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"

TMPDIR=${TMPDIR:-/tmp}
TF_DATA_DIR=$(mktemp -d "${TMPDIR}/terraform_lint.XXXXXX")
trap 'rm -r "${TF_DATA_DIR}"' EXIT
export TF_DATA_DIR

module_dir="${repo_root}/ci/terraform"

printf "Upgrading providers...\n"

printf "\e[92m*\e[0m Initializing..."
terraform -chdir="${module_dir}" init -backend=false -upgrade &>/dev/null
printf " done!\n"

printf "\e[92m*\e[0m Locking provider versions:\n"
terraform -chdir="${module_dir}" providers lock \
    -platform=windows_amd64 \
    -platform=linux_amd64 \
    -platform=linux_arm64 \
    -platform=darwin_amd64 \
    -platform=darwin_arm64
