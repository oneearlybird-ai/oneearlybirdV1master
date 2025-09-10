# Pre-commit Security Hooks (Setup)

This enables fast, on-commit security checks: secrets, Semgrep security packs, ESLint, and TypeScript.

## Install
- Install pre-commit: `pipx install pre-commit` or `pip install pre-commit --user` (ensure `~/.local/bin` on PATH).
- From repo root: `pre-commit install` (enables hooks for commits).

## Detect-Secrets Baseline
- Create once: `detect-secrets scan > .secrets.baseline`
- Audit now: `detect-secrets audit .secrets.baseline`

## What Runs on Commit
- detect-secrets (baseline enforced)
- Semgrep: p/security-audit, p/secrets, p/owasp-top-ten, p/cwe-top-25
- ESLint (JS/TS) with `--max-warnings=0`
- tsc project typecheck (no emit)

## Recommended (Inline Feedback)
- VS Code: ESLint + TypeScript validation on save; Semgrep extension (optional).

## CI (Fail-fast)
- Use `run_quick_checks_ci.sh` for PR gates; `security_max_scan.sh` for full scans.

