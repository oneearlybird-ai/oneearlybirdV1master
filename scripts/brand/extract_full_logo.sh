#!/usr/bin/env bash
set -euo pipefail

# Extract the full logo (yellow bird + white "EarlyBird") from a black-background PNG.
# Produces transparent PNGs (1x/2x/3x) tightly trimmed, with decontaminated edges (no black halos).
# Usage: scripts/brand/extract_full_logo.sh /path/to/EarlyBirdLogo.png

SRC=${1:?"Usage: $0 /path/to/EarlyBirdLogo.png"}
ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
OUT_DIR="$ROOT_DIR/apps/web/public/brand"
TMP_DIR="${TMPDIR:-/tmp}/earlybird_full_$$"
mkdir -p "$OUT_DIR" "$TMP_DIR"

echo "[full-logo] source: $SRC"

# 1) Build an alpha mask that keeps all non-dark pixels (logo content) and removes black bg.
#    The lower bound (#202020) is slightly above near-black to avoid halos; tweak if needed.
magick "$SRC" -alpha off -colorspace sRGB \
  ( +clone -alpha off -color-threshold "#202020-#FFFFFF" -colorspace gray -threshold 50% -type bilevel \) \
  -compose CopyOpacity -composite "$TMP_DIR/logo_rgba.png"

# 2) Tight trim and ensure clean transparent edges.
magick "$TMP_DIR/logo_rgba.png" -alpha on -trim +repage -define png:color-type=6 "$OUT_DIR/logo.png"

# 3) DPR variants.
magick "$OUT_DIR/logo.png" -filter Mitchell -resize 200% "$OUT_DIR/logo@2x.png"
magick "$OUT_DIR/logo.png" -filter Mitchell -resize 300% "$OUT_DIR/logo@3x.png"

echo "[full-logo] wrote: $OUT_DIR/logo.png, logo@2x.png, logo@3x.png"
echo "Done."

