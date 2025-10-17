"use client";
import { apiFetch } from "@/lib/http";
import { dashboardFetch } from "@/lib/dashboardFetch";
import { resolveLogoSrc } from "@/lib/logoAssets";

import { useEffect, useState } from "react";
import { toast } from "@/components/Toasts";

type Provider = { id: string; name: string; connected: boolean };

function Logo({ id, alt }: { id: string; alt: string }) {
  const src = resolveLogoSrc(id) ?? `/logos/${id}.svg`;
  return (
    <div className="h-10 w-32 overflow-hidden rounded-lg border border-white/10 bg-white px-3 py-1.5 flex items-center justify-center">
      <img
        src={src}
        className="block max-h-6 max-w-full object-contain"
        alt={alt}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

function Card({ title, desc, action, logo }: { title: string; desc: string; action: React.ReactNode; logo?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 eb-surface">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logo}
          <div className="font-medium">{title}</div>
        </div>
        {/* status removed per request */}
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
    dashboardFetch('/integrations/status', { cache: 'no-store' })
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
    if (connected) return <button className="btn btn-outline btn-sm" disabled aria-disabled>Connected</button>;
    if (it.oauth && it.connectId) {
      const onConnect = async () => {
        try {
          const res = await apiFetch('/integrations/oauth/start?provider=' + encodeURIComponent(it.connectId!), { method: 'POST' });
          if (res.status === 501) { toast('Linking not available yet', 'error'); return; }
          if (!res.ok) { toast('Connect failed', 'error'); return; }
          const body = await res.json().catch(() => ({} as any));
          if (body?.url && typeof body.url === 'string') {
            window.open(body.url, '_blank', 'noopener');
          } else {
            toast('Check your provider window to continue', 'default');
          }
        } catch {
          toast('Connect failed', 'error');
        }
      };
      return <button className="btn btn-primary btn-sm" type="button" onClick={onConnect} title="Connect to {it.title}">Connect</button>;
    }
    return <button className="btn btn-outline btn-sm" disabled aria-disabled title="Coming soon">Coming soon</button>;
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
            action={actionFor(it)}
          />
        ))}
      </div>
    </section>
  );
}
