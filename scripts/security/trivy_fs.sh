#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="${1:-$(pwd)}"
if ! command -v trivy >/dev/null 2>&1; then echo "trivy not installed" >&2; exit 127; fi
cd "$ROOT_DIR"
# Prefer offline DB if network restricted
trivy fs --scanners vuln,config --skip-db-update --exit-code 1 . || { echo "[trivy] issues found" >&2; exit 1; }

