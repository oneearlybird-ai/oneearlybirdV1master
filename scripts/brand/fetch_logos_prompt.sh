#!/usr/bin/env bash
set -euo pipefail

# Interactive fetch + sanitize of official provider logos into /public/logos
# No editor required. You can paste URLs when prompted.
# Usage: bash scripts/brand/fetch_logos_prompt.sh

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
OUT_DIR="$ROOT_DIR/apps/web/public/logos"
MAP_TXT="$ROOT_DIR/scripts/brand/brand_logo_urls.txt"
mkdir -p "$OUT_DIR"

providers=(
  google-calendar
  microsoft-365
  twilio
  plivo
  vonage
  hubspot
  salesforce
  stripe
  postmark
  zapier
)

declare -A URLS
# Preload defaults if a map file exists
if [[ -f "$MAP_TXT" ]]; then
  while IFS='=' read -r k v; do
    [[ -z "${k// }" || "${k:0:1}" == "#" ]] && continue
    k=$(echo "$k" | xargs)
    v=$(echo "$v" | xargs)
    [[ -n "$k" && -n "$v" ]] && URLS[$k]="$v"
  done < "$MAP_TXT"
fi

echo "[logos] destination: $OUT_DIR"
command -v curl >/dev/null 2>&1 || { echo "curl is required" >&2; exit 1; }
svgo_cmd="svgo"; command -v svgo >/dev/null 2>&1 || { command -v npx >/dev/null 2>&1 && svgo_cmd="npx svgo" || svgo_cmd=""; }

ok=0; skip=0; fail=0
for id in "${providers[@]}"; do
  dest="$OUT_DIR/$id.svg"
  if [[ -f "$dest" ]]; then
    echo "[logos] $id.svg already present — skipping"
    skip=$((skip+1))
    continue
  fi

  url_default="${URLS[$id]:-}"
  echo
  if [[ -n "$url_default" ]]; then
    echo "Paste official SVG URL for $id [Enter to use default]:"
    echo "  default: $url_default"
  else
    echo "Paste official SVG URL for $id (from vendor brand page):"
  fi
  read -r url
  if [[ -z "${url// }" ]]; then
    url="$url_default"
  fi
  if [[ -z "${url// }" ]]; then
    echo "[logos] no URL provided for $id — skipping"
    continue
  fi

  tmp="$(mktemp)"; code=$(curl -sS -L -w "%{http_code}" -o "$tmp" "$url" || echo 000)
  if [[ "$code" != "200" ]]; then
    echo "[logos] fetch failed for $id (HTTP $code)" >&2; rm -f "$tmp"; fail=$((fail+1)); continue
  fi
  if grep -qi "<script\b" "$tmp" || grep -qi "onload=" "$tmp"; then
    echo "[logos] unsafe content in $id — aborting. Use a clean SVG from brand kit." >&2
    rm -f "$tmp"; exit 2
  fi
  if [[ -n "$svgo_cmd" ]]; then
    $svgo_cmd --multipass -q -o "$dest" "$tmp" || cp "$tmp" "$dest"
  else
    cp "$tmp" "$dest"
  fi
  rm -f "$tmp"
  echo "[logos] wrote $dest"
  ok=$((ok+1))
done

echo
echo "[logos] complete: $ok fetched, $skip skipped (already present), $fail failed"

