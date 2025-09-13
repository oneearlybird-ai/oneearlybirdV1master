#!/bin/sh
set -eu

ROOT_DIR=$(cd "$(dirname "$0")/../.." && pwd)
OUT_DIR="$ROOT_DIR/apps/web/public/logos"
mkdir -p "$OUT_DIR"

fetch_one() {
  id="$1"; label="$2"; dest="$OUT_DIR/$id.svg"
  if [ -f "$dest" ]; then echo "[logos] $id.svg already present — skipping"; return 0; fi
  echo "Paste official SVG URL for $label ($id):"
  read url || url=""
  if [ -z "${url%% }" ]; then echo "[logos] no URL provided for $id — skipping"; return 0; fi
  tmp=$(mktemp)
  code=$(curl -sS -L -w "%{http_code}" -o "$tmp" "$url" || echo 000)
  if [ "$code" != "200" ]; then echo "[logos] fetch failed for $id (HTTP $code)" >&2; rm -f "$tmp"; return 1; fi
  if grep -qi "<script\b" "$tmp" || grep -qi "onload=" "$tmp"; then echo "[logos] unsafe SVG content in $id — abort" >&2; rm -f "$tmp"; exit 2; fi
  # Optimize if svgo or npx svgo exists
  if command -v svgo >/dev/null 2>&1; then
    svgo --multipass -q -o "$dest" "$tmp" || cp "$tmp" "$dest"
  elif command -v npx >/dev/null 2>&1; then
    npx -y svgo --multipass -q -o "$dest" "$tmp" || cp "$tmp" "$dest"
  else
    cp "$tmp" "$dest"
  fi
  rm -f "$tmp"
  echo "[logos] wrote $dest"
}

echo "[logos] destination: $OUT_DIR"
command -v curl >/dev/null 2>&1 || { echo "curl is required" >&2; exit 1; }

fetch_one google-calendar "Google Calendar"
fetch_one microsoft-365 "Microsoft 365"
fetch_one twilio "Twilio"
fetch_one plivo "Plivo"
fetch_one vonage "Vonage"
fetch_one hubspot "HubSpot"
fetch_one salesforce "Salesforce"
fetch_one stripe "Stripe"
fetch_one postmark "Postmark"
fetch_one zapier "Zapier"

echo "[logos] done"

