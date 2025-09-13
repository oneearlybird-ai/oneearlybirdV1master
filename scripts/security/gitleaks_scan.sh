#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="${1:-$(pwd)}"
if ! command -v gitleaks >/dev/null 2>&1; then echo "gitleaks not installed" >&2; exit 127; fi
cd "$ROOT_DIR"
gitleaks detect --no-banner --verbose --redact --exit-code 1 || { echo "[gitleaks] potential secrets detected" >&2; exit 1; }

