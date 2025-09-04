export const dynamic = 'force-dynamic';

export default function Pricing() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-24">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Pricing</h1>
        <p className="mt-4 text-white/70 max-w-2xl">
          Simple usage-based pricing. Start free and scale with your call volume.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {/* Starter */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-lg font-medium">Starter</div>
            <div className="mt-2 text-sm text-white/60">For trying things out</div>
            <div className="mt-6 text-3xl font-semibold">$0</div>
            <div className="text-sm text-white/60">+ usage</div>
            <ul className="mt-6 space-y-2 text-sm text-white/80">
              <li>• 100 minutes included</li>
              <li>• Transcripts & recordings</li>
              <li>• Basic routing</li>
            </ul>
            <a href="/signup" className="mt-6 inline-block rounded-lg bg-white px-4 py-2 font-medium text-black">Get started</a>
          </div>

          {/* Growth */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-lg font-medium">Growth</div>
            <div className="mt-2 text-sm text-white/60">For small teams</div>
            <div className="mt-6 text-3xl font-semibold">$99</div>
            <div className="text-sm text-white/60">/mo + usage</div>
            <ul className="mt-6 space-y-2 text-sm text-white/80">
              <li>• 1,500 minutes included</li>
              <li>• Scheduling automation</li>
              <li>• Analytics & exports</li>
            </ul>
            <a href="/signup" className="mt-6 inline-block rounded-lg bg-white px-4 py-2 font-medium text-black">Choose Growth</a>
          </div>

          {/* Scale */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-lg font-medium">Scale</div>
            <div className="mt-2 text-sm text-white/60">For higher volume</div>
            <div className="mt-6 text-3xl font-semibold">Custom</div>
            <div className="text-sm text-white/60">volume pricing</div>
            <ul className="mt-6 space-y-2 text-sm text-white/80">
              <li>• High-volume minutes</li>
              <li>• Advanced routing & integrations</li>
              <li>• SLA & priority support</li>
            </ul>
            <a href="/signup" className="mt-6 inline-block rounded-lg bg-white px-4 py-2 font-medium text-black">Contact sales</a>
          </div>
        </div>

        <div className="mt-12 text-sm text-white/60">
          Need a custom plan? <a className="underline hover:text-white" href="/support">Talk to us</a>.
        </div>
      </section>
    </main>
  );
}
