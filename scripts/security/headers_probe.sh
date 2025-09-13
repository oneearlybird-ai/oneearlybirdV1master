#!/usr/bin/env bash
set -euo pipefail
URL=${1:?"Usage: $0 https://site"}
out=$(curl -sS -I "$URL")
miss=0
need=(
  'content-security-policy:'
  'strict-transport-security:'
  'cross-origin-opener-policy:'
  'cross-origin-embedder-policy:'
  'permissions-policy:'
  'x-content-type-options:'
)
for h in "${need[@]}"; do
  echo "$out" | rg -i "^$h" >/dev/null || { echo "missing header: $h" >&2; miss=1; }
done
exit $miss

