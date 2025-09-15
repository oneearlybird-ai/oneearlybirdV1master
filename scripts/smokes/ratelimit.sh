#!/usr/bin/env bash
set -euo pipefail
BASE=${1:?"Usage: $0 https://vercel-app"}
UA="earlybird-smoke-$(date +%s%N)"

code() { curl -s -o /dev/null -w "%{http_code}" -H "user-agent: $UA" "$@"; }
first=$(code "$BASE/api/ratelimit-test")
second=$(code "$BASE/api/ratelimit-test")
echo "first=$first second=$second"
# Pass if the second is 429 (fresh UA), regardless of first (just in case of race/preload)
[ "$second" = "429" ] || { echo "ratelimit smoke failed" >&2; exit 1; }
echo "OK"
