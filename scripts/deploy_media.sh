#!/usr/bin/env bash
set -euo pipefail

# Deploys media gateway server.mjs to S3 and rolls ASG instances.
# Requires: awscli, shasum

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
ARTIFACT_BUCKET=${ARTIFACT_BUCKET:-oneearlybird-media-artifacts-102732512054-us-east-1}
ASG_NAME=${ASG_NAME:-media-ws-asg}
AWS_REGION=${AWS_REGION:-us-east-1}

SRC_FILE="$ROOT_DIR/infra/terraform/media-gateway/templates/server.mjs"
if [[ ! -f "$SRC_FILE" ]]; then
  echo "server.mjs not found at $SRC_FILE" >&2
  exit 1
fi

SHA=$(shasum -a 256 "$SRC_FILE" | awk '{print $1}')
KEY="media/server-${SHA}.mjs"

echo "[deploy] Uploading $SRC_FILE to s3://$ARTIFACT_BUCKET/$KEY"
aws s3 cp "$SRC_FILE" "s3://$ARTIFACT_BUCKET/$KEY" --content-type application/javascript --region "$AWS_REGION"

echo "[deploy] Updating SSM parameters"
aws ssm put-parameter --region "$AWS_REGION" --name /oneearlybird/media/ARTIFACT_KEY --type String --overwrite --value "$KEY" >/dev/null
aws ssm put-parameter --region "$AWS_REGION" --name /oneearlybird/media/ARTIFACT_SHA256 --type String --overwrite --value "$SHA" >/dev/null

echo "[deploy] Starting ASG instance refresh: $ASG_NAME"
REFRESH_JSON=$(aws autoscaling start-instance-refresh --auto-scaling-group-name "$ASG_NAME" --preferences '{"MinHealthyPercentage":100,"InstanceWarmup":60}' --region "$AWS_REGION")
REFRESH_ID=$(echo "$REFRESH_JSON" | sed -n 's/.*"InstanceRefreshId"\s*:\s*"\([^"]\+\)".*/\1/p')
echo "[deploy] Refresh ID: $REFRESH_ID"

echo "[deploy] Polling refresh status..."
for i in {1..120}; do
  STATUS=$(aws autoscaling describe-instance-refreshes --auto-scaling-group-name "$ASG_NAME" --region "$AWS_REGION" --output json | sed -n 's/.*"Status"\s*:\s*"\([^"]\+\)".*/\1/p' | head -n1)
  PCT=$(aws autoscaling describe-instance-refreshes --auto-scaling-group-name "$ASG_NAME" --region "$AWS_REGION" --output json | sed -n 's/.*"PercentageComplete"\s*:\s*\([0-9]\+\).*/\1/p' | head -n1)
  echo "  status=$STATUS pct=${PCT:-0}%"
  if [[ "$STATUS" == "Successful" ]]; then echo "[deploy] Done"; exit 0; fi
  if [[ "$STATUS" == "Cancelled" || "$STATUS" == "Failed" ]]; then echo "[deploy] Refresh $STATUS"; exit 1; fi
  sleep 10
done

echo "[deploy] Timeout waiting for instance refresh"
exit 1

