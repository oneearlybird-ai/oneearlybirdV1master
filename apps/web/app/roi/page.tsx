export default function ROI() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-3xl font-semibold tracking-tight">Proven ROI</h1>
      <p className="mt-4 text-white/70">
        EarlyBird saves time and boosts revenue by handling inbound calls with intelligence and speed.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-3xl font-semibold">$5–$12</div>
          <div className="mt-2 text-sm text-white/70">typical effective cost per booking</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-3xl font-semibold">60–85%</div>
          <div className="mt-2 text-sm text-white/70">deflection to self-serve</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-3xl font-semibold">24/7</div>
          <div className="mt-2 text-sm text-white/70">coverage with on-brand voice</div>
        </div>
      </div>
    </main>
  );
}
