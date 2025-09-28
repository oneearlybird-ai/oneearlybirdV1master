#!/usr/bin/env bash
set -euo pipefail

# Upload a pre-baked media bundle (node, npm, node_modules, server.mjs) to S3 and set SSM params.
# This avoids runtime npm/apt during boot. Bundle layout (tar.gz root):
#   bin/node
#   bin/npm
#   server.mjs (or entire app dir)
#   node_modules/
#   package.json (optional)

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
ARTIFACT_BUCKET=${ARTIFACT_BUCKET:-oneearlybird-media-artifacts-102732512054-us-east-1}
AWS_REGION=${AWS_REGION:-us-east-1}
BUNDLE_PATH=${BUNDLE_PATH:-}

if [[ -z "$BUNDLE_PATH" || ! -f "$BUNDLE_PATH" ]]; then
  echo "Usage: BUNDLE_PATH=/path/to/media-bundle.tgz AWS_REGION=us-east-1 ./scripts/deploy_media_bundle.sh" >&2
  exit 1
fi

SHA=$(shasum -a 256 "$BUNDLE_PATH" | awk '{print $1}')
KEY="media/bundles/media-bundle-${SHA}.tgz"

echo "[bundle] Uploading $BUNDLE_PATH to s3://$ARTIFACT_BUCKET/$KEY"
aws s3 cp "$BUNDLE_PATH" "s3://$ARTIFACT_BUCKET/$KEY" --content-type application/gzip --region "$AWS_REGION"

echo "[bundle] Updating SSM parameters"
aws ssm put-parameter --region "$AWS_REGION" --name /oneearlybird/media/BUNDLE_KEY --type String --overwrite --value "$KEY" >/dev/null
aws ssm put-parameter --region "$AWS_REGION" --name /oneearlybird/media/BUNDLE_SHA256 --type String --overwrite --value "$SHA" >/dev/null

echo "[bundle] Done. New instances will fetch bundle $KEY and skip apt/npm."

