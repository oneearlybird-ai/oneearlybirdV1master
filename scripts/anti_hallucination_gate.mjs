#!/usr/bin/env node
/**
 * Anti-Hallucination Gate (A.H. Gate)
 * See deployment + CI wiring details in the team playbook.
 * Exit codes: 0 PASS, non-zero FAIL (reasons printed)
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawnSync } from 'node:child_process';

let babelParser = null;
let Ajv = null;
let YAML = null;

const read = (p) => fs.readFileSync(p, 'utf8');
const write = (p, s) => fs.writeFileSync(p, s, 'utf8');
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
const toLF = (s) => s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
const stripTrailingWS = (s) => s.split('\n').map(l => l.replace(/[ \t]+$/g, '')).join('\n');
function norm(s){ let out=toLF(s); out=stripTrailingWS(out); if(!out.endsWith('\n')) out+='\n'; return out; }
function lines(s){ return s.split('\n'); }

function redactSecrets(s){
  if(!s) return s;
  try{
    return String(s).replace(/([a-z]+:\/\/)\S+:\S+@/gi, '$1****:****@');
  }catch{ return s; }
}

const _safeWrite = (w, data) => { try{ w.write(redactSecrets(data)); }catch{ /* noop */ } };

function countCommentLines(filePath, s){
  const ext = path.extname(filePath).toLowerCase();
  const L = lines(s);
  if (ext === '.js' || ext === '.mjs' || ext === '.ts' || ext === '.tsx') {
    let c=0, inBlock=false;
    for (const ln of L) {
      const t = ln.trim();
      if (inBlock){ c++; if (t.includes('*/')) inBlock=false; continue; }
      if (t.startsWith('//')){ c++; continue; }
      if (t.includes('/*')){ c++; if (!t.includes('*/')) inBlock=true; }
    }
    return c;
  }
  return L.filter(ln => ln.trim().startsWith('#')).length;
}

function hfail(msg){ console.log('❌', msg); process.exitCode=1; }
function ok(msg){ console.log('✅', msg); }
function loadJSONMaybe(p){ try{ return JSON.parse(read(p)); }catch{ return null; } }

function spawnOrFail(file, args, opts = {}){
  const argv = Array.isArray(args) ? args : [];
  const res = spawnSync(file, argv, { stdio:'inherit', shell:false, ...opts });
  if (res.status !== 0) hfail(`Command failed: ${file} ${argv.join(' ')}`);
}

function runSafe(file, args = [], opts = {}){
  if (typeof file !== 'string' || (file.includes('/') && file.startsWith('.'))){
    throw new Error('Refusing to run non-whitelisted command');
  }
  const res = spawnSync(file, Array.isArray(args)?args:[], { stdio:'inherit', shell:false, ...opts });
  if (res.error) throw res.error;
  return res.status ?? 0;
}

const args = process.argv.slice(2);
if (args.includes('--help') || args.length===0){
  console.log(`Usage:
  node scripts/anti_hallucination_gate.mjs --config anti_hallucination.config.json
  node scripts/anti_hallucination_gate.mjs --targets "apps/web/**/*.ts,apps/web/**/*.tsx" [--fix]`);
  process.exit(0);
}
function getArg(flag, def){ const i=args.indexOf(flag); return i>=0?args[i+1]:def; }
const configPath = getArg('--config', null);
const targetsArg = getArg('--targets', null);
const allowFix = args.includes('--fix');

let CFG = {
  globs: [],
  exclude: [],
  fix: false,
  denyRegexes: [
    /^(Assistant|User|System):\s/m,
    /\bAs an AI\b/i,
    /\bI(?:'|’)m sorry\b/i,
    /\bHere is the code\b/i,
    /\bBelow is\b/i,
    /```/
  ],
  maxBlankRun: 3,
  maxCommentRatio: 0.40,
  regionGuard: { enabled:true, start:'BEGIN GENERATED', end:'END GENERATED', refRoot:null },
  referenceMetrics: null,
  schemaValidation: [],
  jsParse: { enabled:true, fileExtensions:['.js','.mjs','.ts','.tsx'] },
  externalChecks: { build:null, typecheck:null, test:null, lint:null }
};

if (configPath){
  const loaded = loadJSONMaybe(configPath);
  if(!loaded){ hfail(`Cannot parse config: ${configPath}`); process.exit(2); }
  CFG = { ...CFG, ...loaded };
}
if (targetsArg){ CFG.globs = targetsArg.split(',').map(s=>s.trim()).filter(Boolean); }
if (allowFix) CFG.fix = true;

async function expandGlobs(globs, exclude){
  const { globSync } = await import('glob');
  const set = new Set();
  for (const g of globs) globSync(g, { dot:false, nodir:true, ignore: exclude||[] }).forEach(f=>set.add(f));
  return [...set];
}
function regionHashes(s, start, end){
  const L = lines(s); let inGen=false; const chunks=[]; let buf=[];
  for (const ln of L){
    if(ln.includes(start)){ if(buf.length){ chunks.push(buf.join('\n')); buf=[]; } inGen=true; continue; }
    if(ln.includes(end)){ inGen=false; continue; }
    if(!inGen) buf.push(ln);
  }
  if(buf.length) chunks.push(buf.join('\n'));
  const normalized = chunks.map(norm).join('\n<<<REGION_BREAK>>>\n');
  return sha256(normalized);
}
function compareRegionIntegrity(filePath, currentStr, refStr, start, end){
  const h1 = regionHashes(currentStr, start, end);
  const h2 = regionHashes(refStr, start, end);
  if (h1 !== h2) hfail(`Region integrity failed for ${filePath}: non-generated sections differ from reference`);
}
async function validateSchemaIfNeeded(filePath, text){
  const rules = CFG.schemaValidation||[]; if(!rules.length) return;
  if(!Ajv) Ajv = (await import('ajv')).default;
  if(!YAML) YAML = (await import('yaml')).default;
  const { minimatch } = await import('minimatch');
  for (const r of rules){
    if (minimatch(filePath, r.pattern)){
      const schema = JSON.parse(read(r.schemaFile));
      const ajv = new Ajv({ allErrors:true, allowUnionTypes:true, strict:false });
      const validate = ajv.compile(schema);
      let data; const ext = path.extname(filePath).toLowerCase();
      try{ data = ext==='.yaml'||ext==='.yml' ? YAML.parse(text) : JSON.parse(text); }
      catch(e){ hfail(`${filePath}: invalid ${ext||'JSON'} syntax: ${e.message}`); return; }
      const good = validate(data);
      if(!good){
        const errs = validate.errors?.map(e=>`${e.instancePath||'/'} ${e.message}`).join('; ');
        hfail(`${filePath}: schema validation failed: ${errs||'unknown error'}`);
      }
    }
  }
}
async function parseIfJsTs(filePath, text){
  if(!CFG.jsParse?.enabled) return;
  const ext = path.extname(filePath).toLowerCase();
  if(!CFG.jsParse.fileExtensions.includes(ext)) return;
  if(!babelParser) babelParser = (await import('@babel/parser')).default;
  try{
    babelParser.parse(text, {
      sourceType:'module',
      allowReturnOutsideFunction:true,
      plugins:[
        'jsx','typescript','importMeta','classProperties','classPrivateProperties',
        'classPrivateMethods','topLevelAwait','decorators-legacy'
      ]
    });
  }catch(e){ hfail(`${filePath}: JS/TS parse error: ${e.message}`); }
}
function enforceHeuristics(filePath, text){
  for (let re of (CFG.denyRegexes||[])) { if (typeof re === "string") re = new RegExp(re, "m"); if (re && typeof re.test === "function" && re.test(text)) hfail(`: contains disallowed pattern: `); }
  let run=0, maxRun=0;
  for(const ln of lines(text)){ if(ln.trim()===''){ run++; if(run>maxRun) maxRun=run; } else run=0; }
  if (maxRun > (CFG.maxBlankRun||3)) hfail(`${filePath}: too many consecutive blank lines (> ${CFG.maxBlankRun})`);
  const total = lines(text).length;
  const comments = countCommentLines(filePath, text);
  const ratio = total===0 ? 0 : comments/total;
  if (ratio > (CFG.maxCommentRatio||0.4)) hfail(`${filePath}: comment ratio too high (${(ratio*100).toFixed(1)}% > ${(CFG.maxCommentRatio*100).toFixed(0)}%)`);
}
function enforceReferenceMetrics(filePath, text){
  const ref = CFG.referenceMetrics; if(!ref) return;
  const chars=[...text].length, lns=text.split('\n').length, digest=sha256(text);
  if(typeof ref.chars==='number' && chars!==ref.chars) hfail(`${filePath}: chars mismatch (expected ${ref.chars}, got ${chars})`);
  if(typeof ref.lines==='number' && lns!==ref.lines) hfail(`${filePath}: lines mismatch (expected ${ref.lines}, got ${lns})`);
  if(ref.sha256 && digest!==ref.sha256) hfail(`${filePath}: sha256 mismatch (expected ${ref.sha256}, got ${digest})`);
}

(async function main(){
  if(!CFG.globs?.length){ hfail('No file globs provided (use --config or --targets).'); process.exit(2); }
  const files = await expandGlobs(CFG.globs, CFG.exclude);
  if(!files.length){ hfail('No files matched the provided globs.'); process.exit(2); }

  const refRoot = CFG.regionGuard?.refRoot ? path.resolve(CFG.regionGuard.refRoot) : null;
  const START = CFG.regionGuard?.start || 'BEGIN GENERATED';
  const END = CFG.regionGuard?.end || 'END GENERATED';

  for (const fp of files){
    const raw = read(fp);
    const normalized = norm(raw);
    if(normalized!==raw){
      if(CFG.fix){ write(fp, normalized); console.log(`✍️  normalized: ${fp}`); }
      else { hfail(`${fp}: not normalized (line endings/trailing spaces/missing final newline) — run with --fix`); }
    }
    enforceHeuristics(fp, normalized);
    if (CFG.regionGuard?.enabled && refRoot){
      const rel = path.relative(process.cwd(), fp);
      const refPath = path.join(refRoot, rel);
      if (fs.existsSync(refPath)){ const refStr = norm(read(refPath)); compareRegionIntegrity(fp, normalized, refStr, START, END); }
      else { hfail(`${fp}: reference file not found for region guard (${refPath})`); }
    }
    enforceReferenceMetrics(fp, normalized);
    await validateSchemaIfNeeded(fp, normalized);
    await parseIfJsTs(fp, normalized);
  }

  const X = CFG.externalChecks || {};
  if (X.typecheck) spawnOrFail(X.typecheck[0], X.typecheck[1]);
  if (X.build)     spawnOrFail(X.build[0], X.build[1]);
  if (X.lint)      spawnOrFail(X.lint[0], X.lint[1]);
  if (X.test)      spawnOrFail(X.test[0], X.test[1]);

  if(process.exitCode){ console.log('❌ A.H. Gate FAIL'); process.exit(process.exitCode); }
  ok('A.H. Gate PASS');
})();
