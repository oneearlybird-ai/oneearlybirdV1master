'use client';

import { useEffect, useState } from 'react';

type Check = { name: string; url: string; ok: boolean; status: number; body?: any; error?: string };

export default function StatusPage() {
  const [checks, setChecks] = useState<Check[]>([]);
  const targets = [
    { name: 'Ping (vercel)', url: '/api/ping' },
    { name: 'Upstream health (proxy)', url: '/api/upstream/health' },
  ];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const results: Check[] = [];
      for (const t of targets) {
        try {
          const res = await fetch(t.url, { cache: 'no-store' });
          const ct = res.headers.get('content-type') || '';
          const body = ct.includes('application/json') ? await res.json().catch(() => ({})) : await res.text();
          results.push({ name: t.name, url: t.url, ok: res.ok, status: res.status, body });
        } catch (e: any) {
          results.push({ name: t.name, url: t.url, ok: false, status: 0, error: e?.message || String(e) });
        }
      }
      if (!cancelled) setChecks(results);
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">System Status</h1>
        <p className="mt-2 text-white/70">Client-side checks for API reachability.</p>
        <div className="mt-6 space-y-4">
          {checks.map((c, i) => (
            <div key={i} className="rounded-xl border border-white/10 p-4 bg-white/5">
              <div className="flex items-center justify-between">
                <div className="font-medium">{c.name}</div>
                <span className={`text-sm ${c.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                  {c.ok ? 'OK' : 'FAIL'}
                </span>
              </div>
              <div className="mt-2 text-sm text-white/70">URL: <code>{c.url}</code></div>
              <div className="mt-1 text-sm text-white/70">Status: {c.status}</div>
              {c.body ? (
                <pre className="mt-3 overflow-auto rounded-lg bg-black/50 p-3 text-xs">{JSON.stringify(c.body, null, 2)}</pre>
              ) : null}
              {c.error ? (
                <div className="mt-3 text-xs text-red-400">Error: {c.error}</div>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
