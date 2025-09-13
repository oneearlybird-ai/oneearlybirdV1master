#!/usr/bin/env bash
set -euo pipefail

# Fetch + sanitize official provider logos into apps/web/public/logos.
# Usage:
#   1) Edit scripts/brand/brand_logo_urls.txt with the official SVG URLs
#   2) Run: bash scripts/brand/fetch_logos.sh
# Notes:
#   - We DO NOT alter or recolor marks; we just optimize and strip unsafe content
#   - If a provider requires downloading a brand kit ZIP or manual export,
#     drop the SVG in apps/web/public/logos using the exact filename and skip curl

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
OUT_DIR="$ROOT_DIR/apps/web/public/logos"
MAP="$ROOT_DIR/scripts/brand/brand_logo_urls.txt"
mkdir -p "$OUT_DIR"

need=( \
  google-calendar \
  microsoft-365 \
  twilio \
  plivo \
  vonage \
  hubspot \
  salesforce \
  stripe \
  postmark \
  zapier \
)

echo "[logos] destination: $OUT_DIR"

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required" >&2; exit 1
fi

# Try svgo if available; otherwise fallback to npx svgo
svgo_cmd="svgo"
if ! command -v svgo >/dev/null 2>&1; then
  if command -v npx >/dev/null 2>&1; then svgo_cmd="npx svgo"; else svgo_cmd=""; fi
fi

declare -A URLS
if [ -f "$MAP" ]; then
  while IFS='=' read -r k v; do
    [[ "$k" =~ ^#|^\s*$ ]] && continue
    k=$(echo "$k" | xargs)
    v=$(echo "$v" | xargs)
    URLS[$k]="$v"
  done < "$MAP"
else
  echo "[logos] Map file not found: $MAP"
  echo "Create it and add lines like: provider-id=https://brand.site/path/logo.svg"
fi

ok_count=0; miss_count=0
for id in "${need[@]}"; do
  dest="$OUT_DIR/$id.svg"
  url="${URLS[$id]:-}"
  if [ -n "$url" ]; then
    echo "[logos] fetching $id from $url"
    tmp=$(mktemp)
    http_code=$(curl -sS -L -w "%{http_code}" -o "$tmp" "$url" || echo 000)
    if [ "$http_code" != "200" ]; then
      echo "[logos] fetch failed for $id (HTTP $http_code). Please download manually." >&2
      rm -f "$tmp"
      miss_count=$((miss_count+1))
      continue
    fi
    # Basic safety checks
    if grep -qi "<script\b" "$tmp" || grep -qi "onload=" "$tmp"; then
      echo "[logos] unsafe SVG content detected in $id; aborting. Use a clean asset." >&2
      rm -f "$tmp"; exit 2
    fi
    # Optimize if svgo available
    if [ -n "$svgo_cmd" ]; then
      $svgo_cmd --multipass -q -o "$dest" "$tmp" || cp "$tmp" "$dest"
    else
      cp "$tmp" "$dest"
    fi
    rm -f "$tmp"
    echo "[logos] wrote $dest"
    ok_count=$((ok_count+1))
  else
    echo "[logos] no URL for $id. Place $dest manually from the official brand kit."
    miss_count=$((miss_count+1))
  fi
done

echo "[logos] complete: $ok_count fetched, $miss_count pending"

