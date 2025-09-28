#!/bin/bash
set -euo pipefail
exec > /var/log/user-data.log 2>&1
echo "[user-data] begin $(date -Is)"

export DEBIAN_FRONTEND=noninteractive
retry() { n=0; until [ $n -ge 5 ]; do "$@" && break; n=$((n+1)); echo "[retry] attempt $n failed: $*"; sleep 3; done; [ $n -lt 5 ]; }
retry apt-get update -y
retry apt-get install -y ca-certificates curl gnupg git awscli amazon-cloudwatch-agent

# Optional pre-baked media bundle from S3 (preferred)
BUNDLE_KEY_SSM="$($${AWS:-aws} ssm get-parameter --region ${AWS_REGION} --name /oneearlybird/media/BUNDLE_KEY --query Parameter.Value --output text 2>/dev/null || true)"
BUNDLE_SHA_SSM="$($${AWS:-aws} ssm get-parameter --region ${AWS_REGION} --name /oneearlybird/media/BUNDLE_SHA256 --query Parameter.Value --output text 2>/dev/null || true)"
USE_BUNDLE=0
if [ -n "$BUNDLE_KEY_SSM" ] && [ "$BUNDLE_KEY_SSM" != "None" ] && [ -n "$BUNDLE_SHA_SSM" ] && [ "$BUNDLE_SHA_SSM" != "None" ]; then
  echo "[user-data] fetching bundle from s3://${ARTIFACT_BUCKET}/${BUNDLE_KEY_SSM} (sha256=${BUNDLE_SHA_SSM})"
  if aws s3 cp "s3://${ARTIFACT_BUCKET}/${BUNDLE_KEY_SSM}" /tmp/media-bundle.tgz; then
    echo "${BUNDLE_SHA_SSM}  /tmp/media-bundle.tgz" | sha256sum -c - && USE_BUNDLE=1 || echo "[user-data] bundle sha256 mismatch"
  else
    echo "[user-data] bundle download failed"
  fi
fi

if [ "$USE_BUNDLE" -eq 1 ]; then
  install -d -o root -g root /opt/media-ws
  tar -xzf /tmp/media-bundle.tgz -C /opt/media-ws
  if [ -x /opt/media-ws/bin/node ]; then ln -sf /opt/media-ws/bin/node /usr/bin/node; fi
  if [ -x /opt/media-ws/bin/npm ]; then ln -sf /opt/media-ws/bin/npm /usr/bin/npm; fi
  echo "[user-data] bundle extracted"
else
  # Install Node.js 20 (robust)
  set +e
  mkdir -p /etc/apt/keyrings
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg || true
  NODE_MAJOR=20
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$${NODE_MAJOR}.x nodistro main" > /etc/apt/sources.list.d/nodesource.list || true
  apt-get update -y || true
  apt-get install -y nodejs || true
  if ! command -v node >/dev/null 2>&1; then
    echo "[user-data] NodeSource install failed, attempting Debian nodejs"
    apt-get update -y || true
    apt-get install -y nodejs npm || true
  fi
  if ! command -v node >/dev/null 2>&1; then
    echo "[user-data] Debian nodejs failed, fetching Node tarball"
    ARCH=$(uname -m)
    if [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then NODE_PKG=node-v20.16.0-linux-arm64; else NODE_PKG=node-v20.16.0-linux-x64; fi
    curl -fsSL "https://nodejs.org/dist/v20.16.0/$NODE_PKG.tar.xz" -o /tmp/node.tar.xz && mkdir -p /opt/node && tar -xJf /tmp/node.tar.xz -C /opt/node --strip-components=1 && ln -sf /opt/node/bin/node /usr/bin/node && ln -sf /opt/node/bin/npm /usr/bin/npm || true
  fi
  node -v || echo "[user-data] node not found"
  set -e
fi

# Ensure SSM Agent is installed and running (so instance shows as Managed)
set +e
ARCH=$(uname -m)
if [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
  AGENT_URL="https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/debian_arm64/amazon-ssm-agent.deb"
else
  AGENT_URL="https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/debian_amd64/amazon-ssm-agent.deb"
fi
retry curl -fsSL "$AGENT_URL" -o /tmp/amazon-ssm-agent.deb || echo "[user-data] SSM download failed"
if [ -s /tmp/amazon-ssm-agent.deb ]; then
  dpkg -i /tmp/amazon-ssm-agent.deb || apt-get install -f -y || true
  systemctl enable --now amazon-ssm-agent || systemctl enable --now snap.amazon-ssm-agent.amazon-ssm-agent.service || true
else
  echo "[user-data] SSM agent package missing; continuing without SSM"
fi
set -e

# App directory and artifact fetch
install -d -o root -g root /opt/media-ws
# Allow artifact key/sha to be overridden via SSM for effortless rollouts
ART_KEY_SSM="$($${AWS:-aws} ssm get-parameter --region ${AWS_REGION} --name /oneearlybird/media/ARTIFACT_KEY --query Parameter.Value --output text 2>/dev/null || true)"
ART_SHA_SSM="$($${AWS:-aws} ssm get-parameter --region ${AWS_REGION} --name /oneearlybird/media/ARTIFACT_SHA256 --query Parameter.Value --output text 2>/dev/null || true)"
if [ -n "$ART_KEY_SSM" ] && [ "$ART_KEY_SSM" != "None" ]; then ARTIFACT_KEY="$ART_KEY_SSM"; fi
if [ -n "$ART_SHA_SSM" ] && [ "$ART_SHA_SSM" != "None" ]; then ARTIFACT_SHA256="$ART_SHA_SSM"; fi
echo "[user-data] fetching server.mjs from s3://${ARTIFACT_BUCKET}/${ARTIFACT_KEY} (sha256=${ARTIFACT_SHA256})"
aws s3 cp "s3://${ARTIFACT_BUCKET}/${ARTIFACT_KEY}" /opt/media-ws/server.mjs
echo "${ARTIFACT_SHA256}  /opt/media-ws/server.mjs" | sha256sum -c -
chmod 0644 /opt/media-ws/server.mjs

# Install app deps only if bundle did not include them
if [ "$USE_BUNDLE" -ne 1 ]; then
  cd /opt/media-ws
  npm init -y >/dev/null 2>&1 || true
  npm install --no-audit --omit=dev ws@^8 >/dev/null 2>&1 || true
  cd /
fi

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
# Optional debug API key for diagnostics
EL_API_DBG="$($${AWS:-aws} ssm get-parameter --region ${AWS_REGION} --name /earlybird/eleven/api_key_debug --with-decryption --query Parameter.Value --output text 2>/dev/null || true)"

# Optional log webhook key
LOG_KEY="$($${AWS:-aws} ssm get-parameter --region ${AWS_REGION} --name /earlybird/media/hmac_secret --with-decryption --query Parameter.Value --output text 2>/dev/null || true)"

cat >/etc/default/media-ws <<EOF_ENV
PORT=${PORT}
WS_PATH=${WS_PATH}
MEDIA_AUTH_TOKEN=$${TOKEN}
MEDIA_SHARED_SECRET=$${SHARED_SECRET}
TWILIO_AUTH_TOKEN=$${TWILIO_TOKEN}
ELEVENLABS_API_KEY=$${EL_API}
ELEVENLABS_AGENT_ID=$${EL_AGENT}
ELEVENLABS_WS_URL=$${EL_WS}
ELEVENLABS_API_KEY_DEBUG=$${EL_API_DBG}
VENDOR_SR_HZ=${VENDOR_SR_HZ}
EL_FORWARD_BINARY=true
EL_ACCEPT_BINARY=true
LOG_WEBHOOK_URL=https://oneearlybird.ai/api/voice/logs/ingest
LOG_WEBHOOK_KEY=$${LOG_KEY}
# ConvAI vendor output format. Keep pcm_16000 unless agent is set to ulaw_8000.
VENDOR_OUT_FORMAT=pcm_16000
# Disable autoprobe by default (ConvAI-only when enabled)
DIAG_EL_AUTOPROBE=false
EL_KICK_DELAY_MS=700
EL_SEND_RESPONSE_CREATE_ON_OPEN=true
EL_INITIAL_GREETING=Connected.
EOF_ENV

cat >/etc/systemd/system/media-ws.service <<'EOF_SVC'
[Unit]
Description=EarlyBird Media WebSocket
After=network.target

[Service]
EnvironmentFile=/etc/default/media-ws
ExecStartPre=/bin/sh -c 'cd /opt/media-ws && [ -d node_modules/ws ] || npm install --no-audit --omit=dev ws@^8'
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

# Configure CloudWatch Agent to ship system logs
cat >/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json <<'EOF_CWA'
{
  "metrics": {
    "namespace": "media-ws",
    "append_dimensions": {
      "AutoScalingGroupName": "$${aws:AutoScalingGroupName}",
      "InstanceId": "$${aws:InstanceId}"
    },
    "aggregation_dimensions": [["AutoScalingGroupName"]],
    "metrics_collected": {
      "cpu": { "measurement": ["cpu_usage_idle","cpu_usage_user","cpu_usage_system"], "resources": ["*"], "totalcpu": true },
      "mem": { "measurement": ["mem_used_percent"], "resources": ["*"] },
      "disk": { "measurement": ["used_percent"], "resources": ["/","/opt"] },
      "netstat": { "measurement": ["tcp_established","tcp_time_wait"] }
    }
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/syslog",
            "log_group_name": "/media-ws/syslog",
            "log_stream_name": "{instance_id}",
            "timezone": "UTC"
          },
          {
            "file_path": "/var/log/user-data.log",
            "log_group_name": "/media-ws/user-data",
            "log_stream_name": "{instance_id}",
            "timezone": "UTC"
          }
        ]
      }
    }
  }
}
EOF_CWA

systemctl enable amazon-cloudwatch-agent || true
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json -s || true

# Persistent SSM Agent retry (non-blocking): keep trying in background until active
cat >/usr/local/bin/ssm-agent-retry.sh <<'EOF_SSMR'
#!/bin/bash
set -euo pipefail
log() { echo "[ssm-retry] $*"; }
is_active() {
  systemctl is-active --quiet amazon-ssm-agent || systemctl is-active --quiet snap.amazon-ssm-agent.amazon-ssm-agent.service
}
if is_active; then log "agent already active"; exit 0; fi
ARCH=$(uname -m)
if [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
  AGENT_URL="https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/debian_arm64/amazon-ssm-agent.deb"
else
  AGENT_URL="https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/debian_amd64/amazon-ssm-agent.deb"
fi
set +e
log "attempt deb install"
curl -fsSL "$AGENT_URL" -o /tmp/amazon-ssm-agent.deb && dpkg -i /tmp/amazon-ssm-agent.deb && systemctl enable --now amazon-ssm-agent
is_active && { log "deb path ok"; exit 0; }
log "attempt apt install"
apt-get update -y && apt-get install -y amazon-ssm-agent && systemctl enable --now amazon-ssm-agent
is_active && { log "apt path ok"; exit 0; }
log "attempt snap install"
if command -v snap >/dev/null 2>&1; then
  snap install amazon-ssm-agent && systemctl enable --now snap.amazon-ssm-agent.amazon-ssm-agent.service
fi
is_active && { log "snap path ok"; exit 0; }
log "still not active"; exit 1
EOF_SSMR
chmod +x /usr/local/bin/ssm-agent-retry.sh

cat >/etc/systemd/system/ssm-agent-retry.service <<'EOF_SVC2'
[Unit]
Description=Retry install/start of Amazon SSM Agent
After=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/ssm-agent-retry.sh

[Install]
WantedBy=multi-user.target
EOF_SVC2

cat >/etc/systemd/system/ssm-agent-retry.timer <<'EOF_TIM'
[Unit]
Description=Retry SSM Agent install/start periodically

[Timer]
OnBootSec=60
OnUnitActiveSec=300
Unit=ssm-agent-retry.service

[Install]
WantedBy=timers.target
EOF_TIM

systemctl daemon-reload
systemctl enable --now ssm-agent-retry.timer || true
echo "[user-data] completed $(date -Is)"
