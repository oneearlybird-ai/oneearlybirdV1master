#!/usr/bin/env bash
set -euo pipefail

echo "== Git status =="
git status --porcelain

echo
echo "== Verify GitHub auth (choose one) =="
echo "  • SSH: ssh -T git@github.com   # expect: Hi <user>!"
echo "  • HTTPS+PAT: 'gh auth login' (then choose HTTPS, paste fine-grained PAT with read-only scopes)"
echo
echo "Recommended GitHub scopes (fine-grained or App):"
echo "  - Repository contents: Read"
echo "  - Metadata: Read"
echo "  - Actions: Read"
echo "  - Code scanning alerts: Read"
echo "NO write/admin scopes."

echo
echo "== Verify Vercel auth (viewer/dev without deploy/env mutate) =="
command -v vercel >/dev/null 2>&1 || { echo "Install Vercel CLI first: npm i -g vercel"; exit 1; }
vercel whoami

echo
echo "== Link local directory to Vercel project (no deploy, no env changes) =="
vercel link --yes --project oneearlybird-v1master

echo
echo "== Non-mutating checks =="
echo "-- Vercel project info --"
vercel projects ls | sed -n '1,40p' || true

echo
echo "-- Optional: set a repository variable PREVIEW_URL in GitHub UI for CI read-only smokes --"
echo "  GitHub → Settings → Secrets and variables → Actions → Variables → New variable:"
echo "    Name: PREVIEW_URL"
echo "    Value: https://<latest-preview>.vercel.app"

echo
echo "== Done. This script did not deploy or touch env secrets =="

