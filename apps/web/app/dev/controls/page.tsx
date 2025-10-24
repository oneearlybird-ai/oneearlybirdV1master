'use client';
import { useState } from 'react';
import styles from './page.module.css';
const DEV_ENABLED = process.env.NEXT_PUBLIC_DEV_UI === 'true';
export default function DevControls() {
  const [out, setOut] = useState<string>('ready');
  if (!DEV_ENABLED) return <div className={styles.container}>Dev Controls disabled (set NEXT_PUBLIC_DEV_UI=true)</div>;
  const call = async (path: string, init?: RequestInit) => {
    setOut(`→ ${init?.method || 'GET'} ${path}`);
    try {
      const res = await fetch(path, {
        method: init?.method || 'GET',
        headers: { 'content-type': 'application/json' },
        body: init?.body as BodyInit | null | undefined,
        cache: 'no-store',
      });
      const ct = res.headers.get('content-type') || '';
      const text = ct.includes('application/json') ? JSON.stringify(await res.json(), null, 2) : await res.text();
      setOut(`← ${res.status}\n${text.slice(0, 4000)}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setOut(`ERR ${msg}`);
    }
  };
  return (
    <main className={styles.container}>
      <h1>Dev Controls (flag-gated)</h1>
      <section className={styles.section}>
        <button onClick={() => call('/api/status')}>GET /api/status</button>
        <button onClick={() => call('/api/routes/manifest')}>GET /api/routes/manifest</button>
        <button onClick={() => call('/api/dashboard/usage')}>GET /api/dashboard/usage</button>
        <button onClick={() => call('/api/ratelimit-test')}>GET /api/ratelimit-test</button>
        <button onClick={() => call('/api/voice/incoming', { method:'POST' })}>POST /api/voice/incoming</button>
        <button onClick={() => call('/api/stripe/webhook', { method:'POST' })}>POST /api/stripe/webhook</button>
        <button onClick={() => call('/api/billing/portal', { method:'POST' })}>POST /api/billing/portal</button>
      </section>
      <pre className={styles.output}>{out}</pre>
    </main>
  );
}
