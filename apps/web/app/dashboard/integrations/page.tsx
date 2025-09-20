"use client";

import { useEffect, useState } from "react";

type Provider = { id: string; name: string; connected: boolean };

function Badge({ connected, label }: { connected: boolean; label?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 border text-xs ${connected ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-white/15 bg-white/5 text-white/70'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-emerald-400' : 'bg-white/40'}`} />
      {label || (connected ? 'Connected' : 'Not connected')}
    </span>
  );
}

function Logo({ id, alt }: { id: string; alt: string }) {
  const masked = new Set(['hubspot','salesforce','zoho','twilio','slack','stripe','signalwire','outlook','microsoft-365','zapier','aws']);
  const isMasked = masked.has(id);
  return (
    <div className="h-10 w-32 overflow-hidden rounded-lg border border-white/10 bg-white px-3 py-1.5 flex items-center justify-center">
      {isMasked ? (
        <span className={`logo-mask logo-${id}`} aria-label={alt} />
      ) : (
        <img src={`/logos/${id}.svg`} className="block max-h-6 max-w-full object-contain" alt={alt} />
      )}
    </div>
  );
}

function Card({ title, desc, status, action, logo }: { title: string; desc: string; status: React.ReactNode; action: React.ReactNode; logo?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 eb-surface">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logo}
          <div className="font-medium">{title}</div>
        </div>
        <div className="text-xs text-white/60">{status}</div>
      </div>
      <div className="text-sm text-white/70 mt-1">{desc}</div>
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
      .then((j) => {
        if (cancelled) return;
        const map: Record<string, Provider> = {};
        (j.providers || []).forEach((p: Provider)=>{ map[p.id]=p; });
        setProviders(map);
      })
      .catch(() => {})
      .finally(()=>{ if (!cancelled) setLoading(false); });
    return () => { cancelled = true };
  }, []);

  const items: Array<{ id: string; title: string; desc: string; oauth?: boolean; connectId?: string }> = [
    { id: 'google-calendar', title: 'Calendar (Google)', desc: 'Scheduling on your business calendar', oauth: true, connectId: 'google-calendar' },
    { id: 'microsoft-365', title: 'Calendar (Microsoft 365)', desc: 'Outlook calendar support' },
    { id: 'hubspot', title: 'CRM (HubSpot)', desc: 'Log calls and leads automatically', oauth: true, connectId: 'hubspot' },
    { id: 'salesforce', title: 'CRM (Salesforce)', desc: 'Sync contacts and activities', oauth: true, connectId: 'salesforce' },
    { id: 'slack', title: 'Slack', desc: 'Real-time notifications', oauth: true, connectId: 'slack' },
    { id: 'zoho', title: 'CRM (Zoho)', desc: 'Leads and call logs' },
    { id: 'stripe', title: 'Stripe', desc: 'Billing and usage' },
    { id: 'zapier', title: 'Zapier', desc: 'Automate workflows' },
    { id: 'aws', title: 'AWS S3', desc: 'Secure storage and retrieval' },
  ];

  const actionFor = (it: { id: string; oauth?: boolean; connectId?: string }) => {
    const p = providers[it.connectId || it.id];
    const connected = !!p?.connected;
    if (loading) return <div className="skeleton skeleton-badge" aria-hidden />;
    if (connected) return <button className="btn btn-outline btn-sm">Manage</button>;
    if (it.oauth && it.connectId) return (
      <form method="post" action={`/api/integrations/oauth/start?provider=${encodeURIComponent(it.connectId)}`}>
        <button className="btn btn-primary btn-sm" type="submit">Connect</button>
      </form>
    );
    return <button className="btn btn-outline btn-sm" disabled aria-disabled>Coming soon</button>;
  };

  const statusFor = (it: { id: string; connectId?: string }) => {
    const p = providers[it.connectId || it.id];
    if (loading) return <div className="skeleton skeleton-badge" aria-hidden />;
    return <Badge connected={!!p?.connected} />;
  };

  return (
    <section>
      <h1 className="text-xl font-semibold tracking-tight">Integrations</h1>
      <p className="mt-1 text-sm text-white/60">Connect your tools. OAuth flows open in a new window.</p>
      <div className="mt-6 grid gap-4 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
        {items.map((it) => (
          <Card
            key={it.id}
            logo={<Logo id={it.id} alt={it.title} />}
            title={it.title}
            desc={it.desc}
            status={statusFor(it)}
            action={actionFor(it)}
          />
        ))}
      </div>
    </section>
  );
}
