#!/usr/bin/env node
import fs from 'fs';
import crypto from 'crypto';
function read(file){ return fs.readFileSync(file,'utf8'); }
function sha256(s){ return crypto.createHash('sha256').update(s).digest('hex'); }
function metrics(s){
  return { chars:[...s].length, lines:s.split('\n').length, sha256:sha256(s), flags:{
    doubleEOF:(s.match(/^EOF$/mg)||[]).length>1,
    hasCodeFence:s.includes('```'),
    strayHashLine: /(^|\n)\s*#\s+\S/.test(s),
    missingFinalNewline: !s.endsWith('\n')
  }};
}
function parseRefMetrics(str){
  const out={}; str.split(',').forEach(kv=>{
    const [k,v]=kv.split('=').map(x=>x.trim());
    if(!k||!v) return;
    if(k==='chars'||k==='lines') out[k]=parseInt(v,10);
    else if(k==='sha256') out[k]=v.toLowerCase();
  }); return out;
}
function fail(msg){ console.log('❌',msg); process.exitCode=1; }
const args=process.argv.slice(2);
if(args.includes('--help')||args.length===0){
  console.log('Usage: node scripts/patch_guard.mjs --target file [--ref file | --ref-metrics "chars=123,lines=10,sha256=..."] [--tolerance-chars N] [--tolerance-lines N] [--require-sha]');
  console.log('       node scripts/patch_guard.mjs --selftest'); process.exit(0);
}
if(args.includes('--selftest')){
  const selfFile=process.argv[1]; const s=read(selfFile); const m=metrics(s);
  console.log(`SELFTEST target=${selfFile} chars=${m.chars} lines=${m.lines} sha256=${m.sha256}`);
  console.log(m.chars>0&&m.lines>0?'✅ SELFTEST PASS':'❌ SELFTEST FAIL'); process.exit(m.chars>0&&m.lines>0?0:1);
}
function getArg(name,def){ const i=args.indexOf(name); return i>=0?args[i+1]:def; }
const targetPath=getArg('--target'); const refPath=getArg('--ref'); const refMetricsArg=getArg('--ref-metrics');
const tolChars=parseInt(getArg('--tolerance-chars','0'),10); const tolLines=parseInt(getArg('--tolerance-lines','0'),10);
const requireSha=args.includes('--require-sha');
if(!targetPath){ console.log('❌ Missing --target'); process.exit(2); }
const tStr=read(targetPath); const t=metrics(tStr);
console.log(`TARGET ${targetPath} chars=${t.chars} lines=${t.lines} sha256=${t.sha256}`);
let refM=null;
if(refPath){ const rStr=read(refPath); const r=metrics(rStr); refM={chars:r.chars,lines:r.lines,sha256:r.sha256}; console.log(`REF    ${refPath} chars=${r.chars} lines=${r.lines} sha256=${r.sha256}`); }
else if(refMetricsArg){ refM=parseRefMetrics(refMetricsArg); console.log(`REF-METRICS ${JSON.stringify(refM)}`); }
if(refM){
  const dChars=Math.abs(t.chars-(refM.chars??t.chars)); const dLines=Math.abs(t.lines-(refM.lines??t.lines));
  if('chars' in refM && dChars>tolChars) fail(`Chars differ by ${dChars} (expected ${refM.chars}, got ${t.chars})`);
  if('lines' in refM && dLines>tolLines) fail(`Lines differ by ${dLines} (expected ${refM.lines}, got ${t.lines})`);
  if(requireSha && refM.sha256 && t.sha256!==refM.sha256) fail(`SHA-256 mismatch (expected ${refM.sha256}, got ${t.sha256})`);
}
if(t.flags.doubleEOF) fail('Detected multiple standalone EOF markers');
if(t.flags.hasCodeFence) fail('Detected code fence ``` in patch file');
if(t.flags.strayHashLine) fail('Detected stray leading # line (non-JS/TS comment)');
if(t.flags.missingFinalNewline) fail('Missing final newline');
if(process.exitCode){ console.log('❌ PATCH GUARD FAIL'); process.exit(process.exitCode); }
console.log('✅ PATCH GUARD PASS');
