#!/usr/bin/env bash
set -euo pipefail
# Find accidental http:// URLs (non-local) in source files
# Allows localhost/127.0.0.1/0.0.0.0; excludes node_modules, .git and built folders
ROOT_DIR="${1:-$(pwd)}"
cd "$ROOT_DIR"

rg -n "http://" \
  --hidden \
  --glob '!**/node_modules/**' \
  --glob '!**/.git/**' \
  --glob '!**/.next/**' \
  --glob '!**/dist/**' \
  --glob '!**/build/**' \
  | rg -v "http://(localhost|127\.0\.0\.1|0\.0\.0\.0)" || true

echo "Note: any results above should be reviewed; non-local http URLs are discouraged."

