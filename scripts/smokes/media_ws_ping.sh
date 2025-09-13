#!/usr/bin/env bash
set -euo pipefail

URL="${1:-${MEDIA_WSS_URL:-wss://media.oneearlybird.ai/rtm/voice}}"
echo "Connecting to $URL ..." >&2
if ! command -v npx >/dev/null; then echo "npx not found" >&2; exit 1; fi
npx -y wscat@6 -c "$URL" <<<'ping'

