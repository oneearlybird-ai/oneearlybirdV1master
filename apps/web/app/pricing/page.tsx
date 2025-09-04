export default function Pricing() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-24">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Pricing</h1>
        <p className="mt-4 max-w-2xl text-white/70">
          Simple, usage-based pricing with a free trial to get started.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {/* Starter */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-xl font-medium">Starter</div>
            <div className="mt-2 text-white/70">For solo locations testing voice.</div>
            <div className="mt-6 text-4xl font-semibold">$0</div>
            <div className="text-white/60 text-sm">+ usage</div>
            <ul className="mt-6 space-y-2 text-sm text-white/80 list-disc pl-5">
              <li>500 free seconds</li>
              <li>Inbound calls + basic IVR</li>
              <li>Email transcripts</li>
            </ul>
            <a href="/signup" className="mt-8 inline-block rounded-lg bg-white px-5 py-3 font-medium text-black">
              Start free
            </a>
          </div>

          {/* Growth */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-xl font-medium">Growth</div>
            <div className="mt-2 text-white/70">Multi-seat teams & calendar booking.</div>
            <div className="mt-6 text-4xl font-semibold">$49</div>
            <div className="text-white/60 text-sm">/mo + usage</div>
            <ul className="mt-6 space-y-2 text-sm text-white/80 list-disc pl-5">
              <li>Live scheduling (Google/M365)</li>
              <li>Warm transfers & routing</li>
              <li>Analytics dashboard</li>
            </ul>
            <a href="/signup" className="mt-8 inline-block rounded-lg bg-white px-5 py-3 font-medium text-black">
              Choose Growth
            </a>
          </div>

          {/* Scale */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-xl font-medium">Scale</div>
            <div className="mt-2 text-white/70">High volume & compliance needs.</div>
            <div className="mt-6 text-4xl font-semibold">Custom</div>
            <div className="text-white/60 text-sm">annual</div>
            <ul className="mt-6 space-y-2 text-sm text-white/80 list-disc pl-5">
              <li>SLA & priority support</li>
              <li>Advanced consent controls</li>
              <li>SSO & audit logs</li>
            </ul>
            <a href="/support" className="mt-8 inline-block rounded-lg border border-white/20 px-5 py-3 font-medium">
              Talk to sales
            </a>
          </div>
        </div>

        <p className="mt-10 text-sm text-white/60">
          Usage is billed per minute with sub-second rounding. Taxes may apply.
        </p>
      </section>
    </main>
  );
}
