#!/usr/bin/env bash
# Strict, fail-fast security scanner (local, read-only)
# Exits non-zero on first failing tool or finding. Intended for CI or pre-release gates.
set -euo pipefail

ROOT_DIR="$(pwd)"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
OUT_DIR="/tmp/eb-sec-reports-$TS"
mkdir -p "$OUT_DIR"

have() { command -v "$1" >/dev/null 2>&1; }

echo "== Security max scan @ $TS =="
echo "Reports: $OUT_DIR"

# 0) ESLint / TypeScript (JS/TS)
if [ -f package.json ]; then
  echo "[ESLint]"; have npx || { echo "npx missing"; exit 1; }
  npx eslint . --ext .js,.jsx,.ts,.tsx
  if [ -f tsconfig.json ]; then
    echo "[tsc]"; npx tsc -p .
  fi
fi

# 1) Semgrep (security + secrets + OWASP/CWE) — fail on findings
if have semgrep; then
  echo "[Semgrep] running p/security-audit, p/secrets, p/owasp-top-ten, p/cwe-top-25";
  semgrep --error --timeout=0 \
    --config=p/security-audit \
    --config=p/secrets \
    --config=p/owasp-top-ten \
    --config=p/cwe-top-25 \
    --exclude node_modules --exclude .next --exclude .vercel --exclude dist --exclude build --exclude .git \
    . | tee "$OUT_DIR/semgrep.txt"
else
  echo "semgrep not installed"; exit 1
fi

# 2) Gitleaks (full repo, redact output) — fail on findings
if have gitleaks; then
  echo "[Gitleaks]";
  gitleaks detect --source . --redact --verbose | tee "$OUT_DIR/gitleaks.txt"
else
  echo "gitleaks not installed"; exit 1
fi

# 3) detect-secrets (no baseline write to repo) — fail if findings
if have detect-secrets; then
  echo "[detect-secrets]";
  dsfile="$OUT_DIR/ds.json"
  detect-secrets scan --all-files > "$dsfile"
  # Fail if any results present
  if have jq; then
    cnt=$(jq '.results | length' "$dsfile")
    echo "detect-secrets findings: $cnt" | tee -a "$OUT_DIR/detect-secrets.txt"
    [ "$cnt" -eq 0 ] || { echo "detect-secrets found potential secrets"; exit 1; }
  else
    # jq not present — conservatively fail to avoid false pass
    echo "jq missing; cannot evaluate results. Install jq."; exit 1
  fi
else
  echo "detect-secrets not installed"; exit 1
fi

# 4) Bandit (Python SAST) — only if Python files exist
if ls *.py >/dev/null 2>&1 || git ls-files '*.py' >/dev/null 2>&1; then
  have bandit || { echo "bandit not installed"; exit 1; }
  echo "[Bandit]"; bandit -r . -ll -iii | tee "$OUT_DIR/bandit.txt"
fi

# 5) Dependency vulnerabilities
if [ -f package.json ]; then
  echo "[npm audit]"; npm audit --audit-level=moderate | tee "$OUT_DIR/npm-audit.txt"
fi
if [ -f requirements.txt ]; then
  have safety || { echo "safety not installed"; exit 1; }
  echo "[Safety]"; safety check -r requirements.txt | tee "$OUT_DIR/safety.txt"
fi

# 6) Trivy filesystem (vuln+secret+config) — fail on HIGH/CRITICAL
if have trivy; then
  echo "[Trivy fs]";
  trivy fs --scanners vuln,secret,config --security-checks vuln,secret,config \
    --severity HIGH,CRITICAL --exit-code 1 \
    --skip-dirs node_modules,.next,.vercel,dist,build,.git . | tee "$OUT_DIR/trivy-fs.txt"
else
  echo "trivy not installed"; exit 1
fi

# 7) (Optional) CodeQL — enable with RUN_CODEQL=1
if [ "${RUN_CODEQL:-0}" = "1" ]; then
  have codeql || { echo "codeql not installed"; exit 1; }
  echo "[CodeQL] building DB + analyzing (security-extended)";
  DB="/tmp/codeql-db-$(date -u +%Y%m%dT%H%M%SZ)"
  codeql database create "$DB" --language=javascript --source-root .
  codeql database analyze "$DB" \
    github/codeql-javascript-queries:codeql-suites/javascript-security-extended.qls \
    --format=sarif-latest --output "$OUT_DIR/codeql.sarif" --threads=0
fi

echo "== DONE. See $OUT_DIR for reports. =="

