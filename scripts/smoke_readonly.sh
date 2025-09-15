#!/usr/bin/env bash
set -euo pipefail

run_suite() {
  local BASE="$1"
  echo "[smoke] Target: $BASE"

  # 1) Headers
  bash "$(dirname "$0")/security/headers_probe.sh" "$BASE"

  # 2) Ratelimit 200 -> 429
  bash "$(dirname "$0")/smokes/ratelimit.sh" "$BASE"

  # 3) Stripe webhook (unsigned) -> 403
  code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/webhooks/stripe" -H 'content-type: application/json' -d '{}')
  [ "$code" = "403" ] || { echo "stripe unsigned expected 403 got $code" >&2; exit 1; }

  # 4) Twilio voice incoming (unsigned) -> 403 (or 503 if not configured)
  code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/voice/incoming" -H 'content-type: application/x-www-form-urlencoded' --data 'CallSid=TEST')
  { [ "$code" = "403" ] || [ "$code" = "503" ]; } || { echo "twilio unsigned expected 403/503 got $code" >&2; exit 1; }

  # 5) ElevenLabs personalization/post-call (unsigned) -> 401
  code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/elevenlabs/personalization" -H 'content-type: application/json' -d '{}')
  { [ "$code" = "401" ] || [ "$code" = "403" ]; } || { echo "elevenlabs personalization expected 401/403 got $code" >&2; exit 1; }
  code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/elevenlabs/post-call" -H 'content-type: application/json' -d '{}')
  { [ "$code" = "401" ] || [ "$code" = "403" ]; } || { echo "elevenlabs post-call expected 401/403 got $code" >&2; exit 1; }

  # 6) Storage presign without header -> 403
  code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/storage/presign" -H 'content-type: application/json' -d '{"op":"upload","key":"dev/tenants/abc/audio/2025-09-13/test.wav","contentType":"audio/wav"}')
  [ "$code" = "403" ] || { echo "storage presign without header expected 403 got $code" >&2; exit 1; }

  echo "[smoke] PASS: $BASE"
}

if [ -n "${PROD_URL:-}" ]; then run_suite "$PROD_URL"; fi
if [ -n "${PREVIEW_URL:-}" ]; then run_suite "$PREVIEW_URL"; fi

if [ -z "${PROD_URL:-}" ] && [ -z "${PREVIEW_URL:-}" ]; then
  echo "Usage: set PROD_URL or PREVIEW_URL environment variables" >&2
  exit 2
fi
