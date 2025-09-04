import Link from "next/link";

export default function Pricing() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Pricing</h1>
        <p className="mt-4 max-w-2xl text-white/70">Transparent, usage-aware. Keep margins healthy as you scale.</p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl font-medium">Starter</h3>
            <p className="mt-2 text-white/70 text-sm">For solo providers or small teams testing voice.</p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li>• 1 phone number</li>
              <li>• 1 assistant profile</li>
              <li>• 1,000 minutes included</li>
              <li>• Transcripts & basic analytics</li>
            </ul>
            <div className="mt-6 text-3xl font-semibold">$99<span className="text-base text-white/60">/mo</span></div>
            <Link href="/signup" className="mt-6 inline-block rounded-xl bg-white px-4 py-2 font-medium text-black">Start</Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-6 ring-1 ring-white/20">
            <div className="inline-block rounded-full bg-white/20 px-2 py-0.5 text-xs text-white/90">Most Popular</div>
            <h3 className="mt-2 text-xl font-medium">Growth</h3>
            <p className="mt-2 text-white/70 text-sm">For busy clinics, service businesses, and retail.</p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li>• 3 phone numbers</li>
              <li>• 3 assistant profiles</li>
              <li>• 5,000 minutes included</li>
              <li>• Scheduling + CRM integrations</li>
            </ul>
            <div className="mt-6 text-3xl font-semibold">$399<span className="text-base text-white/60">/mo</span></div>
            <Link href="/signup" className="mt-6 inline-block rounded-xl bg-white px-4 py-2 font-medium text-black">Start</Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl font-medium">Scale</h3>
            <p className="mt-2 text-white/70 text-sm">For multi-location and enterprise deployments.</p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li>• Unlimited numbers</li>
              <li>• Unlimited assistants</li>
              <li>• Committed minutes pricing</li>
              <li>• SSO, DPA, custom SLAs</li>
            </ul>
            <div className="mt-6 text-3xl font-semibold">Talk to sales</div>
            <a href="mailto:sales@earlybird.ai" className="mt-6 inline-block rounded-xl border border-white/20 px-4 py-2 text-white/80 hover:text-white">Contact us</a>
          </div>
        </div>

        <p className="mt-8 text-sm text-white/60">
          Minutes overage billed at usage-based rates; telephony/ASR/TTS pass-through priced with margin guardrails.
        </p>
      </section>
    </main>
  );
}
