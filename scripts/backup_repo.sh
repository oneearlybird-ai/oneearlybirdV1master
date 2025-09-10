#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
DESK="$HOME/Desktop"
NAME="oneearlybirdV1master"
TARBALL="$DESK/${NAME}_src_${TS}.tar.gz"
BUNDLE="$DESK/${NAME}_git_${TS}.bundle"

echo "== EarlyBird backup @ $TS =="
echo "Repo: $ROOT"
echo
echo "-- Creating source tarball (excludes heavy build/vendor dirs) --"
tar -czf "$TARBALL" \
  --exclude='.next' --exclude='.vercel' --exclude='node_modules' --exclude='*.log' \
  -C "$ROOT" .
echo "Created: $TARBALL"

echo
echo "-- Creating full git history bundle --"
git bundle create "$BUNDLE" --all
echo "Created: $BUNDLE"

echo
echo "-- Checksums & sizes --"
if command -v shasum >/dev/null 2>&1; then
  shasum -a 256 "$TARBALL" "$BUNDLE" || true
elif command -v sha256sum >/dev/null 2>&1; then
  sha256sum "$TARBALL" "$BUNDLE" || true
fi
ls -lh "$TARBALL" "$BUNDLE"
echo "== Backup complete =="

