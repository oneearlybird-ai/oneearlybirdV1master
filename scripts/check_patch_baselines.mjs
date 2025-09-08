#!/usr/bin/env node
import fs from 'fs';
import { spawnSync } from 'child_process';

const basePath = 'audit/patch_baselines.json';
if (!fs.existsSync(basePath)) {
  console.log(`❌ Missing ${basePath}. Run the baseline writer first.`);
  process.exit(1);
}
const base = JSON.parse(fs.readFileSync(basePath, 'utf8'));
let fails = 0;

for (const e of base) {
  if (e.missing) { console.log(`❌ SKIP missing target: ${e.path}`); fails++; continue; }
  const ref = `chars=${e.chars},lines=${e.lines},sha256=${e.sha256}`;
  const r = spawnSync('node', ['scripts/patch_guard.mjs', '--target', e.path, '--ref-metrics', ref, '--tolerance-chars', '0', '--tolerance-lines', '0', '--require-sha'], { stdio: 'inherit' });
  if (r.status !== 0) { console.log(`❌ BASELINE MISMATCH: ${e.path}`); fails++; }
  else { console.log(`✅ BASELINE OK: ${e.path}`); }
}

if (fails) { console.log(`❌ PATCH BASELINE CHECKS FAILED (${fails})`); process.exit(1); }
console.log('✅ ALL PATCH BASELINES OK');
