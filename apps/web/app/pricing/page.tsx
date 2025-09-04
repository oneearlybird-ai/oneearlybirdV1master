export default function Pricing() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-3xl font-semibold tracking-tight">Pricing</h1>
      <p className="mt-4 text-white/70">Transparent, usage-based pricing with simple tiers.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 p-6">
          <div className="text-xl font-medium">Starter</div>
          <div className="mt-1 text-3xl font-semibold">$0</div>
          <div className="text-sm text-white/60">+$/min usage</div>
        </div>
        <div className="rounded-2xl border border-white/10 p-6">
          <div className="text-xl font-medium">Growth</div>
          <div className="mt-1 text-3xl font-semibold">$99</div>
          <div className="text-sm text-white/60">includes minutes</div>
        </div>
        <div className="rounded-2xl border border-white/10 p-6">
          <div className="text-xl font-medium">Scale</div>
          <div className="mt-1 text-3xl font-semibold">Custom</div>
          <div className="text-sm text-white/60">volume discounts</div>
        </div>
      </div>
    </main>
  );
}
