#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="${1:-$(pwd)}"
cd "$ROOT_DIR"
rg -n --no-ignore -S "dangerouslySetInnerHTML|<script[ >]|eval\(|new Function\(" apps/web || true

