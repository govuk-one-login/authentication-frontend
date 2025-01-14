#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(git rev-parse --show-toplevel)"
cd "${PROJECT_ROOT}" || exit 1
VENV_DIR="${PROJECT_ROOT}/.venv"

# Ensure python is at least 3.10
min_python_version=3.10
python_version="$(python3 --version | cut -d' ' -f2)"
if [ "$(printf '%s\n' "${min_python_version}" "${python_version}" | sort -V | head -n1)" != "${min_python_version}" ]; then
    # shellcheck disable=SC2016
    printf 'CRITICAL:wrapper:Please install python %s or later (found: %s). You could probably use `brew install python@3.12`' "${min_python_version}" "${python_version}"
    exit 1
fi

# test if a python virtualenv already exists
if [ -d "${VENV_DIR}" ]; then
    echo "INFO:wrapper:Using existing virtualenv"
else
    echo "INFO:wrapper:Creating virtualenv"
    python3 -m venv "${VENV_DIR}"
fi

# activate the virtualenv
# shellcheck source=/dev/null
source "${VENV_DIR}/bin/activate"

# last_updated file is used to check if we need to reinstall dependencies
LAST_UPDATED_FILE="${VENV_DIR}/.last_updated"

LAST_REQUIREMENTS_UPDATE="$(git log -1 --pretty="format:%ct" "${PROJECT_ROOT}/pyproject.toml")"

if [ -f "${LAST_UPDATED_FILE}" ]; then
    last_updated=$(date -r "${LAST_UPDATED_FILE}" +%s)
else
    last_updated=0
fi
now=$(date +%s)

force_update_every=2592000 # 30 days

# if requirements.txt has been updated since the last time we updated dependencies, update them
if [ ! $((LAST_REQUIREMENTS_UPDATE - last_updated)) -lt 0 ]; then
    echo "INFO:wrapper:pyproject.toml has been updated since last dependencies update"
    echo "INFO:wrapper:Updating python dependencies"
    pushd "${PROJECT_ROOT}" || exit 1
    pip3 install .
    popd || exit 1
    touch "${LAST_UPDATED_FILE}"
    last_updated="${now}"
    echo
    echo

# force update dependencies every $force_update_every seconds, regardless of requirements.txt changes
elif [ ! $((now - last_updated)) -lt 864000 ]; then
    echo "INFO:wrapper:Force updating python dependencies as it has been more than $((force_update_every / 86400)) days since last update"
    pip3 install --upgrade .
    touch "${LAST_UPDATED_FILE}"
    echo
    echo
else
    echo "INFO:wrapper:Using existing dependencies"
fi

FROM_WRAPPER=true python3 "${PROJECT_ROOT}/scripts/_create_env_file.py" "$@"
