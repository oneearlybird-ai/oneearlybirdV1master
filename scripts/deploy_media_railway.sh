#!/usr/bin/env bash
# Version-agnostic Railway deploy for apps/media
set -euo pipefail
app="${RAILWAY_APP_NAME:-earlybird-media}"
port="${PORT:-8080}"
path="${WS_PATH:-/rtm/voice}"

if ! command -v railway >/dev/null 2>&1; then
  curl -fsSL https://railway.app/install.sh | bash
  export PATH="$HOME/.railway/bin:$PATH"
fi

railway whoami >/dev/null 2>&1 || {
  if [ -n "${RAILWAY_TOKEN:-}" ]; then
    railway login --browserless --token "$RAILWAY_TOKEN"
  else
    railway login
  fi
}

pushd apps/media >/dev/null

# Link this folder to the service (idempotent across CLI variants)
railway link || true

# Ensure project/service exist; if not, init (non-interactive if possible)
railway init -n "$app" || true

# Set runtime variables (PORT/WS_PATH) without relying on service flags
railway variables set PORT="$port" WS_PATH="$path" || true

# Sanity: ensure start script exists
npm pkg get scripts.start >/dev/null 2>&1 || { echo "Missing scripts.start"; exit 1; }

# Deploy using version-agnostic command
railway up || railway deploy || true

popd >/dev/null

echo "----"
echo "If a domain is shown in the Railway dashboard (e.g., https://*.up.railway.app):"
echo "  Health: curl -s https://<domain>/ | jq ."
echo "  WS:     npx wscat -c wss://<domain>${path}"
