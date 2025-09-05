'use client';
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/http';

export default function StatusPage() {
  const [state, setState] = useState<{ ok: boolean; ms?: number; error?: string }>({
    ok: false,
  });

  useEffect(() => {
    const t0 = performance.now();
    apiFetch<{ ok: boolean }>('/health')
      .then((r) => setState({ ok: !!r.ok, ms: Math.round(performance.now() - t0) }))
      .catch((e) => setState({ ok: false, error: e?.message || 'error' }));
  }, []);

  return (
    <main className="mx-auto max-w-xl px-6 py-24">
      <h1 className="text-2xl font-semibold tracking-tight">System Status</h1>
      <div className="mt-6 rounded-2xl border border-white/10 p-6">
        <div className="flex items-center gap-3">
          <span
            className={`inline-block h-3 w-3 rounded-full ${
              state.ok ? 'bg-green-500' : state.error ? 'bg-red-500' : 'bg-yellow-500'
            }`}
          />
          <span className="text-white/80">
            API {state.ok ? 'OK' : state.error ? 'ERROR' : 'Checking…'}
            {typeof state.ms === 'number' ? ` (${state.ms} ms)` : ''}
            {state.error ? ` – ${state.error}` : ''}
          </span>
        </div>
      </div>
      <p className="mt-4 text-white/60 text-sm">
        This page calls <code>/api/upstream/health</code> via the proxy.
      </p>
    </main>
  );
}
