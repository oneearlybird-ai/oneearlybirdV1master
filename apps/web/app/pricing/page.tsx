export default function PricingPage() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Pricing</h1>
        <p className="mt-4 max-w-2xl text-white/70">
          Simple, usage-based pricing. Pick a plan that fits your team, then pay per minute of calling.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {/* Starter */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm uppercase tracking-widest text-white/60">Starter</div>
            <div className="mt-2 text-3xl font-semibold">$29</div>
            <div className="text-sm text-white/60">per month</div>
            <ul className="mt-6 space-y-3 text-sm text-white/80">
              <li>• 1 number</li>
              <li>• Basic routing</li>
              <li>• Email support</li>
            </ul>
            <a
              href="/signup"
              className="mt-8 inline-block rounded-xl bg-white px-5 py-3 font-medium text-black"
            >
              Get started
            </a>
          </div>

          {/* Growth */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm uppercase tracking-widest text-white/60">Growth</div>
            <div className="mt-2 text-3xl font-semibold">$99</div>
            <div className="text-sm text-white/60">per month</div>
            <ul className="mt-6 space-y-3 text-sm text-white/80">
              <li>• Up to 5 numbers</li>
              <li>• Advanced routing & transfers</li>
              <li>• Priority support</li>
            </ul>
            <a
              href="/signup"
              className="mt-8 inline-block rounded-xl border border-white/20 px-5 py-3 font-medium"
            >
              Choose Growth
            </a>
          </div>

          {/* Scale */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm uppercase tracking-widest text-white/60">Scale</div>
            <div className="mt-2 text-3xl font-semibold">Custom</div>
            <div className="text-sm text-white/60">contact sales</div>
            <ul className="mt-6 space-y-3 text-sm text-white/80">
              <li>• Unlimited numbers</li>
              <li>• SSO, audit logs</li>
              <li>• SLA & onboarding</li>
            </ul>
            <a
              href="/support"
              className="mt-8 inline-block rounded-xl border border-white/20 px-5 py-3 font-medium"
            >
              Talk to sales
            </a>
          </div>
        </div>

        <p className="mt-10 text-sm text-white/60">
          Usage billed per minute; carrier fees pass-through. Taxes may apply.
        </p>
      </div>
    </main>
  );
}
