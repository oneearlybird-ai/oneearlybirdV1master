#!/usr/bin/env bash
set -euo pipefail

# One-shot fetch + sanitize of official provider logos into /public/logos.
# Edit the URL map below with the official SVG URLs from each provider's brand page
# and run:  bash scripts/brand/fetch_logos_all.sh

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
OUT_DIR="$ROOT_DIR/apps/web/public/logos"
mkdir -p "$OUT_DIR"

# REQUIRED: fill with official SVG links (no third-party mirrors, no PNGs)
declare -A URLS=(
  # [provider-id]="https://official.brand.site/path/to/logo.svg"
  [google-calendar]=""
  [microsoft-365]=""
  [twilio]=""
  [plivo]=""
  [vonage]=""
  [hubspot]=""
  [salesforce]=""
  [stripe]=""
  [postmark]=""
  [zapier]=""
)

need=(google-calendar microsoft-365 twilio plivo vonage hubspot salesforce stripe postmark zapier)

echo "[logos] destination: $OUT_DIR"
command -v curl >/dev/null 2>&1 || { echo "curl is required" >&2; exit 1; }
svgo_cmd="svgo"; command -v svgo >/dev/null 2>&1 || { command -v npx >/dev/null 2>&1 && svgo_cmd="npx svgo" || svgo_cmd=""; }

ok=0; miss=0
for id in "${need[@]}"; do
  url="${URLS[$id]:-}"
  dest="$OUT_DIR/$id.svg"
  if [ -z "$url" ]; then echo "[logos] MISSING URL for $id — update this script"; miss=$((miss+1)); continue; fi
  echo "[logos] fetching $id from $url"; tmp=$(mktemp)
  code=$(curl -sS -L -w "%{http_code}" -o "$tmp" "$url" || echo 000)
  if [ "$code" != "200" ]; then echo "[logos] fetch failed for $id (HTTP $code)" >&2; rm -f "$tmp"; miss=$((miss+1)); continue; fi
  if grep -qi "<script\b" "$tmp" || grep -qi "onload=" "$tmp"; then echo "[logos] unsafe SVG content in $id" >&2; rm -f "$tmp"; exit 2; fi
  if [ -n "$svgo_cmd" ]; then $svgo_cmd --multipass -q -o "$dest" "$tmp" || cp "$tmp" "$dest"; else cp "$tmp" "$dest"; fi
  rm -f "$tmp"; echo "[logos] wrote $dest"; ok=$((ok+1))
done

echo "[logos] complete: $ok fetched, $miss pending"

