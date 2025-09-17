export const dynamic = 'force-static';

export default function Docs() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white px-6 py-16">
      <section className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Documentation</h1>
        <p className="mt-4 text-white/70">Everything you need to launch your AI receptionist with managed telephony.</p>

        <h2 className="mt-10 text-xl font-medium">Getting Started</h2>
        <ul className="mt-3 list-disc pl-5 text-white/80 space-y-2">
          <li>
            Managed Telephony — We provision the phone number(s) for you or help port your existing numbers. No separate
            Twilio account required.
          </li>
          <li>
            One Invoice — Usage and platform fees are billed together via Stripe. No additional carrier invoices.
          </li>
          <li>
            Configuration — In the dashboard, set business hours, routing preferences, and calendar/CRM connections.
          </li>
        </ul>

        <h2 className="mt-10 text-xl font-medium">Authentication</h2>
        <p className="mt-3 text-white/80">
          API requests require an API key (for server-to-server) and standard session auth for the dashboard.
          Manage credentials in your dashboard.
        </p>

        <h2 className="mt-10 text-xl font-medium">Key Endpoints</h2>
        <ul className="mt-3 list-disc pl-5 text-white/80 space-y-1">
          <li><code>POST /api/v1/calls</code> — create and route a new call</li>
          <li><code>GET /api/v1/calls/:id</code> — fetch call status and transcript</li>
          <li><code>POST /api/v1/customers</code> — create or update a customer profile</li>
        </ul>

        <h2 className="mt-10 text-xl font-medium">Support</h2>
        <p className="mt-3 text-white/80">
          Need a new number or want to port? Email <a className="underline" href="mailto:support@earlybird.ai">support@earlybird.ai</a> or visit
          <a className="underline ml-1" href="/support">Support</a>.
        </p>
      </section>
    </main>
  );
}
