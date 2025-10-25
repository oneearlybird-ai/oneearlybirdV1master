#!/usr/bin/env bash
set -euo pipefail

echo "=== 1) detect secrets (quick) ==="
detect-secrets scan > .secrets.baseline || true
detect-secrets audit .secrets.baseline || true

echo "=== 2) gitleaks secret scan ==="
gitleaks detect -s . || true

echo "=== 3) language linters / type check ==="
if [ -f package.json ]; then
  echo "-- ESLint (JS/TS) --"
  npx eslint . --ext .js,.jsx,.ts,.tsx || true
  if [ -f tsconfig.json ]; then
    echo "-- tsc typecheck --"
    npx tsc -p . || true
  fi
fi

if ls *.py &>/dev/null; then
  echo "-- Bandit (Python SAST) --"
  bandit -r . || true
fi

echo "=== 4) semgrep (fast multi-lang SAST) ==="
semgrep --config=auto || true

echo "=== 5) dependency vulnerabilities ==="
if [ -f package.json ]; then
  echo "-- npm audit --"
  npm audit --audit-level=moderate || true
fi
if [ -f requirements.txt ]; then
  echo "-- safety check Python deps --"
  safety check -r requirements.txt || true
fi

echo "=== 6) CodeQL (deep analysis - requires codeql CLI) ==="
if command -v codeql >/dev/null 2>&1; then
  mkdir -p codeqldb
  echo "building CodeQL DB (may take a while)..."
  codeql database create codeqldb --language=javascript --source-root=. || true
  codeql database analyze codeqldb --format=sarif-latest --output=codeql-results.sarif || true
else
  echo "codeql not installed; skipping"
fi

echo "=== 7) Trivy infra scan (Dockerfile / IaC) ==="
if [ -f Dockerfile ]; then
  trivy fs --severity HIGH,CRITICAL --exit-code 0 --no-progress .
fi
if ls *.tf 2>/dev/null; then
  trivy config --severity HIGH,CRITICAL . || true
fi

echo "=== Done. Review outputs above. ==="

