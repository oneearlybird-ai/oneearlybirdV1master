#!/usr/bin/env bash
set -euo pipefail
BASE=${1:?"Usage: $0 https://vercel-app"}

code() { curl -s -o /dev/null -w "%{http_code}" "$@"; }
first=$(code "$BASE/api/ratelimit-test")
second=$(code "$BASE/api/ratelimit-test")
echo "first=$first second=$second"
[ "$first" = "200" ] && [ "$second" = "429" ] || { echo "ratelimit smoke failed" >&2; exit 1; }
echo "OK"

