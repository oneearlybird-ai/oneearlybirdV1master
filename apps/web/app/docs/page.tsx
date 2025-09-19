export const dynamic = 'force-static';
import CopyLinkButton from "@/components/CopyLinkButton";

export default function Docs() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white px-6 py-16">
      <section className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Documentation</h1>
        <nav className="mt-3 text-sm text-white/70 sticky top-[calc(var(--eb-header-h)+8px)] z-10 bg-neutral-950/75 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/55 rounded px-2 py-1" aria-label="On this page">
          <a className="underline mr-3" href="#getting-started">Getting Started</a>
          <a className="underline mr-3" href="#porting">Porting</a>
          <a className="underline mr-3" href="#authentication">Authentication</a>
          <a className="underline" href="#endpoints">Endpoints</a>
        </nav>
        <div className="mt-2 text-xs text-white/60"><a className="underline" href="#content">Back to top</a></div>
        <p className="mt-4 text-white/70">Everything you need to launch your AI receptionist with managed telephony.</p>

        <div className="mt-10 flex items-center justify-between gap-2">
          <h2 id="getting-started" className="text-xl font-medium">Getting Started</h2>
          <CopyLinkButton anchorId="getting-started" />
        </div>
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

        <div className="mt-10 flex items-center justify-between gap-2">
          <h2 id="porting" className="text-xl font-medium">Porting your number</h2>
          <CopyLinkButton anchorId="porting" />
        </div>
        <p className="mt-3 text-white/80">Already have a phone number? We’ll port it for you.</p>
        <p className="mt-2 text-white/70">Gather your account number, port‑out PIN, service address, and the numbers to move, then <a className="underline" href="/support/porting">start a port request</a>.</p>

        <div className="mt-10 flex items-center justify-between gap-2">
          <h2 id="authentication" className="text-xl font-medium">Authentication</h2>
          <CopyLinkButton anchorId="authentication" />
        </div>
        <p className="mt-3 text-white/80">
          API requests require an API key (for server-to-server) and standard session auth for the dashboard.
          Manage credentials in your dashboard.
        </p>

        <div className="mt-10 flex items-center justify-between gap-2">
          <h2 id="endpoints" className="text-xl font-medium">Key Endpoints</h2>
          <CopyLinkButton anchorId="endpoints" />
        </div>
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
        <div className="mt-6 text-xs text-white/60"><a className="underline" href="#content">Back to top</a></div>

        <h2 className="mt-10 text-xl font-medium">Security & Guardrails</h2>
        <ul className="mt-3 list-disc pl-5 text-white/80 space-y-1">
          <li>Strict CSP with per-request nonce; no inline scripts or eval.</li>
          <li>HSTS preload, COOP/COEP, Permissions-Policy deny-by-default.</li>
          <li>Signed webhooks, short-lived presigned URLs, minimal logs (no PHI).</li>
          <li>Rate limits on sensitive endpoints; cache-control: no-store as needed.</li>
          <li>Small, reviewable changes: ≤120 LOC per patch; security gates must pass.</li>
        </ul>
      </section>
    </main>
  );
}
