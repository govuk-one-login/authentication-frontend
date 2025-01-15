#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

export DEPLOY_ENV="dev"
export AWS_PROFILE="di-auth-development-admin"

# shellcheck source=scripts/dev_deploy_common.sh
source "${DIR}/scripts/dev_deploy_common.sh"
