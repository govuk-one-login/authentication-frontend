#!/usr/bin/env bash
# Inlines CloudFront function JS files and Lambda function JS files into the SAM template before sam package.
# Usage: ./scripts/inline-cloudfront-functions.sh
# Output: cloudformation/apex-website/apex-cloudfront-built.yaml (gitignored)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
FUNCTIONS_DIR="$REPO_ROOT/apex-website/cloudfront-functions"
TEMPLATE_IN="$REPO_ROOT/cloudformation/apex-website/apex-cloudfront.yaml"
TEMPLATE_OUT="$REPO_ROOT/cloudformation/apex-website/apex-cloudfront-built.yaml"

echo "» Building SAM template"

python3 - "$TEMPLATE_IN" "$TEMPLATE_OUT" "$FUNCTIONS_DIR" <<'EOF'
import sys, re

template_in   = sys.argv[1]
template_out  = sys.argv[2]
functions_dir = sys.argv[3]

with open(template_in) as f:
    template = f.read()

with open(f"{functions_dir}/redirect.js") as f:
    redirect_code = f.read()

with open(f"{functions_dir}/apex-static-redirect-page.js") as f:
    apex_code = f.read()

def indent(code, spaces=8):
    pad = " " * spaces
    return "\n".join(pad + line for line in code.splitlines())

template = re.sub(r"( *)# __REDIRECT_FUNCTION_CODE__",  lambda m: indent(redirect_code, len(m.group(1))), template)
template = re.sub(r"( *)# __APEX_FUNCTION_CODE__",      lambda m: indent(apex_code,     len(m.group(1))), template)

with open(template_out, "w") as f:
    f.write(template)
EOF

echo "✓ Built template written to: $TEMPLATE_OUT"
