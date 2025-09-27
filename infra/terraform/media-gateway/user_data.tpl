#!/bin/bash
set -euo pipefail
exec > /var/log/user-data.log 2>&1
echo "[user-data] begin $(date -Is)"

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl gnupg git awscli amazon-cloudwatch-agent

# Install Node.js 20 (NodeSource)
mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
NODE_MAJOR=20
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$${NODE_MAJOR}.x nodistro main" > /etc/apt/sources.list.d/nodesource.list
apt-get update -y
apt-get install -y nodejs
node -v

# Ensure SSM Agent is installed and running (so instance shows as Managed)
ARCH=$(uname -m)
if [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
  AGENT_URL="https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/debian_arm64/amazon-ssm-agent.deb"
else
  AGENT_URL="https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/debian_amd64/amazon-ssm-agent.deb"
fi
curl -fsSL "$AGENT_URL" -o /tmp/amazon-ssm-agent.deb
dpkg -i /tmp/amazon-ssm-agent.deb || apt-get install -f -y
systemctl enable --now amazon-ssm-agent || systemctl enable --now snap.amazon-ssm-agent.amazon-ssm-agent.service || true

# App directory and artifact fetch
install -d -o root -g root /opt/media-ws
echo "[user-data] fetching server.mjs from s3://${ARTIFACT_BUCKET}/${ARTIFACT_KEY}"
aws s3 cp "s3://${ARTIFACT_BUCKET}/${ARTIFACT_KEY}" /opt/media-ws/server.mjs
echo "${ARTIFACT_SHA256}  /opt/media-ws/server.mjs" | sha256sum -c -
chmod 0644 /opt/media-ws/server.mjs

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
echo "[user-data] completed $(date -Is)"
