"use client";
export const dynamic = "force-dynamic";
import { INTEGRATIONS } from "./catalog";
import { useEffect, useState } from "react";

function ConnectBtn({ provider }: { provider: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function start() {
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/integrations/oauth/start?provider=${encodeURIComponent(provider)}`, { method: 'POST', cache: 'no-store' });
      const data = await res.json().catch(() => ({} as any));
      if (res.status === 501) {
        setErr('Coming soon');
      } else if (!res.ok) {
        const msg = data?.message || res.statusText || 'unavailable';
        setErr(String(msg));
      } else if (data?.url) {
        window.location.href = data.url as string;
      } else {
        setErr('No redirect URL');
      }
    } catch {
      setErr('network');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <button onClick={start} disabled={busy} className="mt-3 rounded-lg border border-white/20 px-3 py-1 text-sm disabled:opacity-50">
        {busy ? 'Connecting…' : 'Connect'}
      </button>
      {err ? <div className="mt-2 text-xs text-red-300">{err}</div> : null}
    </div>
  );
}

export default function IntegrationsPage() {
  const [status, setStatus] = useState<Record<string, boolean>>({})
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/integrations/status', { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok || !data?.ok) return
        const map: Record<string, boolean> = {}
        for (const p of (data.providers||[])) map[p.id] = !!p.connected
        if (!cancelled) setStatus(map)
      } catch { /* ignore */ }
    })()
    return () => { cancelled = true }
  }, [])
  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight mb-4">Integrations</h2>
      <div className="grid gap-4 md:grid-cols-4">
        {INTEGRATIONS.map((it) => (
          <div key={it.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="font-medium">{it.name}</div>
            <div className="mt-1 text-xs text-white/60">Status: {status[it.id] ? 'Connected' : 'Not connected'}</div>
            <ConnectBtn provider={it.id} />
          </div>
        ))}
      </div>
    </section>
  );
}
