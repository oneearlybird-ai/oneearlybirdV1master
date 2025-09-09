'use client';
import { useState } from 'react';
const DEV_ENABLED = process.env.NEXT_PUBLIC_DEV_UI === 'true';
export default function DevControls() {
  const [out, setOut] = useState<string>('ready');
  if (!DEV_ENABLED) return <div style={{padding:16}}>Dev Controls disabled (set NEXT_PUBLIC_DEV_UI=true)</div>;
  const call = async (path: string, init?: RequestInit) => {
    setOut(`→ ${init?.method || 'GET'} ${path}`);
    try {
      const res = await fetch(path, { method: init?.method || 'GET', headers: { 'content-type': 'application/json' }, body: init?.body as any, cache: 'no-store' });
      const ct = res.headers.get('content-type') || '';
      const text = ct.includes('application/json') ? JSON.stringify(await res.json(), null, 2) : await res.text();
      setOut(`← ${res.status}\n${text.slice(0, 4000)}`);
    } catch (e: any) { setOut(`ERR ${e?.message || e}`); }
  };
  return (
    <main style={{padding:16, display:'grid', gap:8}}>
      <h1>Dev Controls (flag-gated)</h1>
      <section style={{display:'grid', gap:6}}>
        <button onClick={() => call('/api/status')}>GET /api/status</button>
        <button onClick={() => call('/api/routes/manifest')}>GET /api/routes/manifest</button>
        <button onClick={() => call('/api/usage/summary')}>GET /api/usage/summary</button>
        <button onClick={() => call('/api/ratelimit-test')}>GET /api/ratelimit-test</button>
        <button onClick={() => call('/api/voice/incoming', { method:'POST' })}>POST /api/voice/incoming</button>
        <button onClick={() => call('/api/stripe/webhook', { method:'POST' })}>POST /api/stripe/webhook</button>
        <button onClick={() => call('/api/billing/portal', { method:'POST' })}>POST /api/billing/portal</button>
      </section>
      <pre style={{whiteSpace:'pre-wrap', background:'#111', color:'#eee', padding:12, borderRadius:6, minHeight:160}}>{out}</pre>
    </main>
  );
}
