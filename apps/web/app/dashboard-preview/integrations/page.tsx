function Card({ title, desc, status, action }: { title: string; desc: string; status: string; action: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
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
  return (
    <section>
      <h1 className="text-xl font-semibold tracking-tight">Integrations</h1>
      <div className="mt-6 grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
        <Card
          title="Phone (Twilio)"
          desc="Ingress number connected to EarlyBird"
          status="Connected"
          action={<button className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:text-white">Manage</button>}
        />
        <Card
          title="Calendar (Google)"
          desc="Scheduling on your business calendar"
          status="Connected as user@business.com"
          action={<button className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:text-white">Manage</button>}
        />
        <Card
          title="Calendar (Outlook)"
          desc="Microsoft 365 calendar support"
          status="Not connected"
          action={<button className="rounded-md bg-white text-black px-3 py-1.5 text-sm font-medium hover:bg-white/90">Connect</button>}
        />
        <Card
          title="CRM (Salesforce/HubSpot/Zoho)"
          desc="Log calls and leads automatically"
          status="Connected (HubSpot)"
          action={<button className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:text-white">Manage</button>}
        />
        <Card
          title="Slack"
          desc="Real-time notifications"
          status="Not connected"
          action={<button className="rounded-md bg-white text-black px-3 py-1.5 text-sm font-medium hover:bg-white/90">Connect</button>}
        />
      </div>
    </section>
  );
}

