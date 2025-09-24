#!/bin/bash
set -euo pipefail
exec > /var/log/user-data.log 2>&1
echo "[user-data] begin $(date -Is)"

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl gnupg git awscli

# Install Node.js 20 (NodeSource)
mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
NODE_MAJOR=20
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$${NODE_MAJOR}.x nodistro main" > /etc/apt/sources.list.d/nodesource.list
apt-get update -y
apt-get install -y nodejs
node -v

# App directory
install -d -o root -g root /opt/media-ws
cat >/opt/media-ws/server.mjs <<'EOF_MWS'
${server_mjs}
EOF_MWS

# Install app deps locally so 'require("ws")' resolves
cd /opt/media-ws
npm init -y >/dev/null 2>&1 || true
npm install --no-audit --omit=dev ws@^8 >/dev/null 2>&1 || true
cd /

# Fetch MEDIA_AUTH_TOKEN from SSM Parameter Store (fallback to baked value if unavailable)
TOKEN="$($${AWS:-aws} ssm get-parameter --region ${AWS_REGION} --name /oneearlybird/media/MEDIA_AUTH_TOKEN --with-decryption --query Parameter.Value --output text 2>/dev/null || true)"
if [ -z "$TOKEN" ] || [ "$TOKEN" = "None" ]; then TOKEN="${MEDIA_AUTH_TOKEN}"; fi

# Fetch MEDIA_SHARED_SECRET (JWT) and Twilio Auth Token for WS upgrade validation
SHARED_SECRET="$($${AWS:-aws} ssm get-parameter --region ${AWS_REGION} --name /oneearlybird/media/SHARED_SECRET --with-decryption --query Parameter.Value --output text 2>/dev/null || true)"
TWILIO_TOKEN="$($${AWS:-aws} ssm get-parameter --region ${AWS_REGION} --name /oneearlybird/twilio/AUTH_TOKEN --with-decryption --query Parameter.Value --output text 2>/dev/null || true)"

# Fetch ElevenLabs API key and agent id from SSM if present (fallback to baked envs)
EL_API="$($${AWS:-aws} ssm get-parameter --region ${AWS_REGION} --name /earlybird/eleven/api_key --with-decryption --query Parameter.Value --output text 2>/dev/null || true)"
if [ -z "$EL_API" ] || [ "$EL_API" = "None" ]; then EL_API="${ELEVENLABS_API_KEY}"; fi
EL_AGENT="$($${AWS:-aws} ssm get-parameter --region ${AWS_REGION} --name /earlybird/eleven/agent_id --query Parameter.Value --output text 2>/dev/null || true)"
EL_WS="$($${AWS:-aws} ssm get-parameter --region ${AWS_REGION} --name /earlybird/eleven/ws_url --query Parameter.Value --output text 2>/dev/null || true)"

cat >/etc/default/media-ws <<EOF_ENV
PORT=${PORT}
WS_PATH=${WS_PATH}
MEDIA_AUTH_TOKEN=$${TOKEN}
MEDIA_SHARED_SECRET=$${SHARED_SECRET}
TWILIO_AUTH_TOKEN=$${TWILIO_TOKEN}
ELEVENLABS_API_KEY=$${EL_API}
ELEVENLABS_AGENT_ID=$${EL_AGENT}
ELEVENLABS_WS_URL=$${EL_WS}
EL_FORWARD_BINARY=true
EOF_ENV

cat >/etc/systemd/system/media-ws.service <<'EOF_SVC'
[Unit]
Description=EarlyBird Media WebSocket
After=network.target

[Service]
EnvironmentFile=/etc/default/media-ws
ExecStart=/usr/bin/node /opt/media-ws/server.mjs
WorkingDirectory=/opt/media-ws
Restart=always
RestartSec=2
User=root
LimitNOFILE=131072

[Install]
WantedBy=multi-user.target
EOF_SVC

systemctl daemon-reload
systemctl enable --now media-ws.service
echo "[user-data] completed $(date -Is)"
