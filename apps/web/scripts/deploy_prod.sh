#!/usr/bin/env bash
set -euo pipefail
export CI=1
export VERCEL_FORCE_NO_TTY=1

# Change to apps/web (script directory is apps/web/scripts)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEBROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$WEBROOT"

# Configurable via environment
PROJECT="${PROJECT:-oneearlybird-v1master}"
SCOPE_ARG=""
[[ -n "${TEAM_SLUG:-}" ]] && SCOPE_ARG="--scope $TEAM_SLUG"
TOKEN_ARG=""
[[ -n "${VERCEL_TOKEN:-}" ]] && TOKEN_ARG="--token $VERCEL_TOKEN"

# 0) Verify Vercel auth
vercel whoami $SCOPE_ARG $TOKEN_ARG >/dev/null 2>&1 || { echo "VERCEL_NOT_LOGGED_IN ❌"; exit 1; }

# 1) Link once if needed (keeps .vercel in this app root)
if [ ! -f ".vercel/project.json" ]; then
  vercel link --yes --project "$PROJECT" $SCOPE_ARG $TOKEN_ARG >/dev/null
fi

# 2) Typecheck only (avoid local Next build to prevent EPERM)
npm run typecheck

# 3) Cloud build + deploy (non-interactive)
TMP_OUT="$(mktemp)"
vercel --prod --yes $SCOPE_ARG $TOKEN_ARG | tee "$TMP_OUT" >/dev/null
URL="$(grep -Eo 'https://[^ ]+\.vercel\.app' "$TMP_OUT" | tail -n1 || true)"
rm -f "$TMP_OUT"
if [ -z "$URL" ]; then echo "DEPLOY_URL_MISSING ❌"; exit 1; fi
echo "DEPLOY_URL=$URL"

# 4) Header smoke (top lines)
echo "HEADERS_TOP:"
curl -sS -D - "$URL" -o /dev/null | tr -d '\r' | sed -n '1,80p'

# 5) Manifest and unsigned webhook smokes
echo -n "manifest:"; curl -s -o /dev/null -w "%{http_code}\n" "$URL/api/routes/manifest"
echo -n "stripe_webhook_unsigned:"; curl -s -o /dev/null -w "%{http_code}\n" -X POST "$URL/api/stripe/webhook"

