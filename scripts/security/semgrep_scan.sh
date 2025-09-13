#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="${1:-$(pwd)}"
CFG="${CFG:-.semgrep/earlybird.yml}"
if ! command -v semgrep >/dev/null 2>&1; then echo "semgrep not installed" >&2; exit 127; fi
cd "$ROOT_DIR"
SEMGREP_SEND_METRICS=0 semgrep --metrics=off --disable-version-check --config "$CFG" --error || { echo "[semgrep] findings detected" >&2; exit 1; }
