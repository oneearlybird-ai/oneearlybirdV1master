#!/usr/bin/env bash
set -euo pipefail

# Exact bird extraction from logo using ImageMagick
# Usage: scripts/brand/extract_bird.sh /path/to/EarlyBirdLogo.png
# Output: apps/web/public/brand/bird.png (+ @2x/@3x)

SRC=${1:?"Usage: $0 /path/to/EarlyBirdLogo.png"}
ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
OUT_DIR="$ROOT_DIR/apps/web/public/brand"
TMP_DIR="${TMPDIR:-/tmp}/earlybird_extract_$$"
mkdir -p "$OUT_DIR" "$TMP_DIR"

echo "[extract] source: $SRC"

# 1) Create a binary mask for near-brand-yellow regions (bird)
#    Adjust fuzz if needed (default ~15%).
magick "$SRC" -alpha off \
  -fuzz 15% -fill white -opaque "#F2C230" \
  -colorspace gray -threshold 50% -type bilevel \
  +write "$TMP_DIR/mask.png" \
  NULL:

# 2) Find connected components and pick the leftmost large component as the bird
CC_INFO=$(magick "$TMP_DIR/mask.png" \
  -define connected-components:area-threshold=100 \
  -define connected-components:verbose=true \
  -connected-components 8 \
  NULL: 2>&1 | awk '/Objects:/{flag=1; next} flag && NF {print}')

if [ -z "$CC_INFO" ]; then
  echo "[extract] failed to detect components; try adjusting fuzz." >&2
  exit 1
fi

# Parse bounding boxes like: 4: 123x67+12+28 ...
GEOM=$(echo "$CC_INFO" | awk '{print $2, $3}' | awk '{print $1}' | head -n 1)
# As a fallback, choose the smallest x offset component
if [ -z "$GEOM" ]; then
  GEOM=$(echo "$CC_INFO" | awk '{print $2}' | sort -t+ -k2,2n | head -n 1)
fi

echo "[extract] using geometry: $GEOM"

# 3) Crop the original logo to the bird geometry
magick "$SRC" -crop "$GEOM" +repage "$OUT_DIR/bird.png"

# 4) Generate @2x and @3x for DPR crispness
magick "$OUT_DIR/bird.png" -filter Mitchell -resize 200% "$OUT_DIR/bird@2x.png"
magick "$OUT_DIR/bird.png" -filter Mitchell -resize 300% "$OUT_DIR/bird@3x.png"

echo "[extract] wrote: $OUT_DIR/bird.png, bird@2x.png, bird@3x.png"
echo "Done. Commit these and I will wire the header to use them."

