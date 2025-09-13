#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="${1:-$(pwd)}"
cd "$ROOT_DIR"
fail=0
routes=(
  apps/web/app/api/voice/incoming/route.ts
  apps/web/app/api/voice/status/route.ts
  apps/web/app/api/webhooks/stripe/route.ts
  apps/web/app/api/elevenlabs/personalization/route.ts
  apps/web/app/api/elevenlabs/post-call/route.ts
  apps/web/app/api/storage/presign/route.ts
)
for f in "${routes[@]}"; do
  [ -f "$f" ] || continue
  rg -q "export const runtime\s*=\s*['\"]nodejs['\"]" "$f" || { echo "missing runtime=nodejs in $f"; fail=1; }
  rg -q "export const dynamic\s*=\s*['\"]force-dynamic['\"]" "$f" || { echo "missing dynamic=force-dynamic in $f"; fail=1; }
done
exit $fail
