#!/usr/bin/env bash
set -euo pipefail
app="${RAILWAY_APP_NAME:-earlybird-media}"
port="${PORT:-8080}"
path="${WS_PATH:-/rtm/voice}"

if ! command -v railway >/dev/null 2>&1; then
  curl -fsSL https://railway.app/install.sh | bash
  export PATH="$HOME/.railway/bin:$PATH"
fi

railway whoami >/dev/null 2>&1 || railway login

railway up --service "$app" || railway init -n "$app"
railway variables set PORT="$port" WS_PATH="$path"
railway npm i
railway run npm run start & sleep 2; kill $! 2>/dev/null || true

railway deploy --service "$app" --detach

echo "----"
echo "Deployed media service:"
railway status --service "$app" || true
echo "If a domain is shown (e.g., https://*.up.railway.app), WS path is: wss://<domain>${path}"

