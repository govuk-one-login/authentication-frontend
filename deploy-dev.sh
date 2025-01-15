#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

export DEPLOY_ENV="dev"
export AWS_PROFILE="di-auth-development-admin"

read -p "Are you sure? Make sure you've read the commit message before running this script. (y)" -n 1 -r
if [[ ! $REPLY == "y" ]]
then
  echo Exiting
  [[ "$0" = "$BASH_SOURCE" ]] && exit 1 || return 1
fi

# shellcheck source=scripts/dev_deploy_common.sh
source "${DIR}/scripts/dev_deploy_common.sh"
