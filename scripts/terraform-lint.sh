#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"

TMPDIR=${TMPDIR:-/tmp}
TF_DATA_DIR=$(mktemp -d "${TMPDIR}/terraform_lint.XXXXXX")
trap 'rm -r "${TF_DATA_DIR}"' EXIT
export TF_DATA_DIR

module_dir="${repo_root}/ci/terraform"

printf "Validating \e[1;93m%s\e[0m...\n" "terraform"
printf "\e[92m*\e[0m Initializing..."
terraform -chdir="${module_dir}" init -backend=false &>/dev/null
printf " done!\n"

terraform -chdir="${module_dir}" validate
terraform -chdir="${module_dir}" fmt -write=false -diff -recursive >>"${TF_DATA_DIR}"/lint
if [ -s "${TF_DATA_DIR}"/lint ]; then
    printf "\e[1;91m%s\e[0m\n" "The following files need to be formatted:"
    cat "${TF_DATA_DIR}"/lint
else
    printf "\e[92m*\e[0m No formatting issues found.\n"
fi
