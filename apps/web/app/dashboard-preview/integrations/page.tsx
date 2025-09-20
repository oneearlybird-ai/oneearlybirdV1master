"use client";

import { useEffect, useState } from "react";

type Provider = { id: string; name: string; connected: boolean };

function Badge({ connected }: { connected: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 border text-xs ${connected ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-white/15 bg-white/5 text-white/70'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-emerald-400' : 'bg-white/40'}`} />
      {connected ? 'Connected' : 'Not connected'}
    </span>
  );
}

function Card({ title, desc, status, action }: { title: string; desc: string; status: React.ReactNode; action: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 eb-surface">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-sm text-white/70">{desc}</div>
        </div>
        <div className="text-xs text-white/60">{status}</div>
      </div>
      <div className="mt-3">{action}</div>
    </div>
  );
}

export default function IntegrationsPage() {
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<Record<string, Provider>>({});
  useEffect(() => {
    let cancelled = false;
    fetch('/api/integrations/status', { cache: 'no-store' })
      .then(r => r.json())
      .then((body) => {
        if (cancelled) return;
        const map: Record<string, Provider> = {};
        (body.providers || []).forEach((p: Provider) => { map[p.id] = p; });
        setProviders(map);
      })
      .catch(() => { /* ignore in preview */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true };
  }, []);

  const S = (id: string, fallbackText?: string) => loading
    ? (<span className="skeleton skeleton-badge" aria-hidden />)
    : (<Badge connected={!!providers[id]?.connected} />);

  return (
    <section>
      <h1 className="text-xl font-semibold tracking-tight">Integrations</h1>
      <div className="mt-6 grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
        <Card
          title="Phone (Twilio)"
          desc="Ingress number connected to EarlyBird"
          status={S('twilio')}
          action={<button className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:text-white">Manage</button>}
        />
        <Card
          title="Calendar (Google)"
          desc="Scheduling on your business calendar"
          status={S('google-calendar')}
          action={<button className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:text-white">Manage</button>}
        />
        <Card
          title="Calendar (Outlook)"
          desc="Microsoft 365 calendar support"
          status={<Badge connected={false} />}
          action={<button className="rounded-md bg-white text-black px-3 py-1.5 text-sm font-medium hover:bg-white/90">Connect</button>}
        />
        <Card
          title="CRM (Salesforce/HubSpot/Zoho)"
          desc="Log calls and leads automatically"
          status={S('hubspot')}
          action={<button className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:text-white">Manage</button>}
        />
        <Card
          title="Slack"
          desc="Real-time notifications"
          status={S('slack')}
          action={<button className="rounded-md bg-white text-black px-3 py-1.5 text-sm font-medium hover:bg-white/90">Connect</button>}
        />
      </div>
    </section>
  );
}
