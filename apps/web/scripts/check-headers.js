const https = require('https');

const url = process.env.HEADER_CHECK_URL || 'https://oneearlybird.ai';
const u = new URL(url);
const host = u.hostname;
const allowPoweredBy = /\.vercel\.app$/.test(host);

const MUST_HAVE = [
  'content-security-policy',
  'strict-transport-security',
  'permissions-policy',
  'cross-origin-opener-policy',
  'cross-origin-embedder-policy'
];

https.get(url, (res) => {
  const headers = Object.fromEntries(
    Object.entries(res.headers).map(([k,v]) => [k.toLowerCase(), Array.isArray(v)? v.join(', '): String(v||'')])
  );
  let ok = true;
  const findings = [];

  for (const h of MUST_HAVE) {
    if (!headers[h]) { ok = false; findings.push(`MISSING: ${h}`); }
  }

  const csp = headers['content-security-policy'] || '';
  const hsts = headers['strict-transport-security'] || '';

  if (!/'nonce-[^']+'/.test(csp)) {
    ok = false; findings.push("CSP missing dynamic 'nonce-' token");
  }
  if (!/preload/i.test(hsts)) {
    ok = false; findings.push('HSTS missing "preload"');
  }
  if (!allowPoweredBy && ('x-powered-by' in headers)) {
    ok = false; findings.push('X-Powered-By should be absent');
  }

  if (!ok) {
    console.error('❌ Header check failed at', url);
    for (const f of findings) console.error(' -', f);
    process.exit(1);
  } else {
    console.log('✅ Headers OK at', url);
    for (const h of MUST_HAVE) console.log(` - ${h}:`, headers[h]);
    process.exit(0);
  }
}).on('error', (e) => {
  console.error('❌ Request error:', e.message);
  process.exit(2);
});
