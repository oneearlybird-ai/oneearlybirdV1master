export const dynamic = 'force-dynamic';

export default function Pricing() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-24">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Pricing</h1>
        <p className="mt-4 max-w-2xl text-white/70">
          Simple, transparent plans. Upgrade or cancel anytime.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {/* Starter */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm uppercase tracking-widest text-white/60">Starter</div>
            <div className="mt-3 text-3xl font-semibold">$39<span className="text-lg text-white/60">/mo</span></div>
            <ul className="mt-6 space-y-2 text-white/80">
              <li>• 1 number</li>
              <li>• 500 min included</li>
              <li>• Basic analytics</li>
            </ul>
            <a href="/signup" className="mt-8 inline-block rounded-lg bg-white px-4 py-2 font-medium text-black">
              Start free
            </a>
          </div>

          {/* Growth */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm uppercase tracking-widest text-white/60">Growth</div>
            <div className="mt-3 text-3xl font-semibold">$149<span className="text-lg text-white/60">/mo</span></div>
            <ul className="mt-6 space-y-2 text-white/80">
              <li>• 5 numbers</li>
              <li>• 3,000 min included</li>
              <li>• Advanced analytics & exports</li>
            </ul>
            <a href="/signup" className="mt-8 inline-block rounded-lg bg-white px-4 py-2 font-medium text-black">
              Get started
            </a>
          </div>

          {/* Scale */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm uppercase tracking-widest text-white/60">Scale</div>
            <div className="mt-3 text-3xl font-semibold">Custom</div>
            <ul className="mt-6 space-y-2 text-white/80">
              <li>• Unlimited numbers</li>
              <li>• Volume rates</li>
              <li>• SSO, SAML, audit logs</li>
            </ul>
            <a href="/signup" className="mt-8 inline-block rounded-lg bg-white px-4 py-2 font-medium text-black">
              Talk to sales
            </a>
          </div>
        </div>

        <p className="mt-8 text-sm text-white/60">
          Overages billed at standard per-minute rates. Taxes/VAT may apply.
        </p>
      </section>
    </main>
  );
}
