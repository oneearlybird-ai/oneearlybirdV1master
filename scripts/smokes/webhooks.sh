#!/usr/bin/env bash
set -euo pipefail
BASE=${1:?"Usage: $0 https://vercel-app"}

code() { curl -s -o /dev/null -w "%{http_code}" "$@"; }

echo "Twilio incoming (unsigned) should be 403" >&2
ci=$(code -X POST "$BASE/api/voice/incoming")
echo "status: $ci"; [ "$ci" = "403" ]

echo "Twilio status (unsigned) should be 403" >&2
cs=$(code -X POST "$BASE/api/voice/status")
echo "status: $cs"; [ "$cs" = "403" ]

echo "ElevenLabs personalization (unsigned) should be 403" >&2
cp=$(code -X POST "$BASE/api/elevenlabs/personalization")
echo "status: $cp"; [ "$cp" = "403" ]

echo "Stripe (unsigned) should be 400 or 403" >&2
st=$(code -X POST "$BASE/api/webhooks/stripe")
echo "status: $st"; [[ "$st" = "400" || "$st" = "403" ]]

echo "OK"

