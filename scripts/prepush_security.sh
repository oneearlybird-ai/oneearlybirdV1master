#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

have() { command -v "$1" >/dev/null 2>&1; }

EXCLUDES=(--exclude node_modules --exclude .next --exclude .vercel --exclude dist --exclude build --exclude .git)

echo "[pre-push] heavy security scan starting..."

# Semgrep: broader security packs (fail on findings)
have semgrep || { echo "semgrep not installed"; exit 1; }
semgrep --error --timeout=0 \
  --config=p/security-audit \
  --config=p/secrets \
  --config=p/owasp-top-ten \
  --config=p/cwe-top-25 \
  "${EXCLUDES[@]}" .

# Trivy: filesystem scan (fail on HIGH/CRITICAL)
have trivy || { echo "trivy not installed"; exit 1; }
trivy fs --scanners vuln,secret,config --security-checks vuln,secret,config \
  --severity HIGH,CRITICAL --exit-code 1 \
  --skip-dirs node_modules,.next,.vercel,dist,build,.git .

echo "[pre-push] heavy security scan finished successfully"

