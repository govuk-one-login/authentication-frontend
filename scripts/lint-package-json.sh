#!/bin/bash
set -euo pipefail

if grep -E '\^|~' package.json; then
  echo 'Use pinned versions!'
  exit 1
else
  exit 0
fi
