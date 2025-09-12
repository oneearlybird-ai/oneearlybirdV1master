export const dynamic = "force-dynamic";
export default function IntegrationsPage() {
  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight mb-4">Integrations</h2>
      <div className="grid gap-4 md:grid-cols-4">
        {["Google Calendar","Microsoft 365","Twilio","Plivo","Vonage","HubSpot","Salesforce","Stripe"].map((name)=> (
          <div key={name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="font-medium">{name}</div>
            <div className="mt-1 text-xs text-white/60">Status: Not connected</div>
            <button className="mt-3 rounded-lg border border-white/20 px-3 py-1 text-sm">Connect</button>
          </div>
        ))}
      </div>
    </section>
  );
}

