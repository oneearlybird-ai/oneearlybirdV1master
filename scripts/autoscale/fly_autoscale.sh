#!/usr/bin/env bash
set -euo pipefail
# Simple autoscaler: starts a second Machine if backpressure or high FPS; stops it when idle.
# Requirements: flyctl, jq; env: FLY_API_TOKEN (for CI), APP (default earlybird-media), METRICS_URL.

APP=${APP:-earlybird-media}
METRICS_URL=${METRICS_URL:-"https://${APP}.fly.dev/metrics"}
START_FPS=${START_FPS:-80}           # if fps10s > START_FPS, start standby
START_BACKP=${START_BACKP:-1}        # if backpressureCount10m >= START_BACKP, start standby
STOP_FPS=${STOP_FPS:-20}             # if fps10s < STOP_FPS and no backpressure, can stop standby
IDLE_SEC=${IDLE_SEC:-120}            # if no messages for >= IDLE_SEC and standby running, stop it

have() { command -v "$1" >/dev/null 2>&1; }
have jq || { echo "jq required" >&2; exit 127; }
have flyctl || { echo "flyctl required" >&2; exit 127; }

# Get metrics
METRIC_JSON=$(curl -fsS "$METRICS_URL" || echo '{}')
FPS=$(jq -r '.fps10s // 0' <<<"$METRIC_JSON")
BPC=$(jq -r '.backpressureCount10m // 0' <<<"$METRIC_JSON")
LASTMSG=$(jq -r '.lastMsgAgoSec // 0' <<<"$METRIC_JSON")

# Machine states
MLIST=$(flyctl machines list -a "$APP" --json)
STARTED_IDS=($(jq -r '.[] | select(.state=="started") | .id' <<<"$MLIST"))
STOPPED_IDS=($(jq -r '.[] | select(.state!="started") | .id' <<<"$MLIST"))
TOTAL=$(jq 'length' <<<"$MLIST")
STARTED=${#STARTED_IDS[@]}

echo "metrics: fps10s=$FPS backpressure10m=$BPC lastMsgAgoSec=$LASTMSG started=$STARTED total=$TOTAL"

start_standby() {
  if [ ${#STOPPED_IDS[@]} -gt 0 ]; then
    local sid="${STOPPED_IDS[0]}";
    echo "Starting standby $sid..."; flyctl machine start "$sid" -a "$APP" || true
  else
    echo "No stopped machines to start.";
  fi
}

stop_standby() {
  if [ $STARTED -gt 1 ]; then
    local sid="${STARTED_IDS[-1]}" # stop the last one
    echo "Stopping standby $sid..."; flyctl machine stop "$sid" -a "$APP" || true
  else
    echo "Only one started machine; not stopping.";
  fi
}

if [ $STARTED -lt 2 ] && { [ "$FPS" -gt "$START_FPS" ] || [ "$BPC" -ge "$START_BACKP" ]; }; then
  start_standby
  exit 0
fi

if [ $STARTED -gt 1 ] && [ "$FPS" -lt "$STOP_FPS" ] && [ "$BPC" -eq 0 ] && [ "$LASTMSG" -ge "$IDLE_SEC" ]; then
  stop_standby
fi

exit 0

