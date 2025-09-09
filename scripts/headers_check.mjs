#!/usr/bin/env node
const url = (process.argv[2] || process.env.CHECK_URL || process.env.NEXT_PUBLIC_SITE_URL || '').trim();
if (!url) { console.error('headers_check: No URL provided. Pass as arg or set CHECK_URL/NEXT_PUBLIC_SITE_URL'); process.exit(2); }
const fetch2xx = async (u) => {
  let r = await fetch(u, { method: 'HEAD', redirect: 'manual' }).catch(()=>null);
  if (!r || r.status >= 400) r = await fetch(u, { method: 'GET', redirect: 'manual' }).catch(()=>null);
  if (!r) { console.error('headers_check: fetch failed'); process.exit(2); }
  return r;
};
(async () => {
  const res = await fetch2xx(url);
  const H = new Map(); for (const [k, v] of res.headers) H.set(k.toLowerCase(), String(v||'')); const get = (n)=>H.get(n.toLowerCase());
  const fails = [];
  const requireIncl = (name, must=[]) => { const v=get(name)||''; if (!v) { fails.push(`${name}: missing`); return; } for (const m of must) if (!v.toLowerCase().includes(m.toLowerCase())) fails.push(`${name}: missing "${m}"`); };
  const requireEq = (name, expect) => { const v=get(name)||''; if (v.trim() !== expect) fails.push(`${name}: expected "${expect}", got "${v}"`); };
  const requireOneOf = (name, opts=[]) => { const v=get(name)||''; if (!opts.some(o=>v.toLowerCase().includes(o.toLowerCase()))) fails.push(`${name}: none of [${opts.join(', ')}]`); };
  const requireAbsent = (name) => { if (H.has(name.toLowerCase())) fails.push(`${name}: should be absent`); };
  const csp = get('content-security-policy')||''; if (!csp) fails.push('Content-Security-Policy: missing'); if (csp.includes("'unsafe-inline'")) fails.push("CSP: must not include 'unsafe-inline'"); if (!/nonce-/.test(csp)) fails.push('CSP: missing nonce-*');
  requireIncl('strict-transport-security', ['max-age=', 'includesubdomains', 'preload']);
  requireIncl('permissions-policy', ['geolocation=()', 'camera=()', 'microphone=()']);
  requireEq('x-xss-protection', '0');
  requireIncl('cross-origin-opener-policy', ['same-origin']);
  requireOneOf('cross-origin-embedder-policy', ['require-corp', 'credentialless']);
  requireAbsent('x-powered-by');
  if (fails.length) { console.error('headers_check: FAIL\n' + fails.map(f=>' - '+f).join('\n')); process.exit(1); }
  console.log('headers_check: PASS');
})();
