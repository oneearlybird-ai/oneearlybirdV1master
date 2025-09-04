export const metadata = {
  title: "Proven ROI • EarlyBird",
  description: "Model the savings and revenue impact of EarlyBird’s AI receptionist.",
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="text-3xl font-semibold">{value}</div>
      <div className="mt-2 text-white/70">{label}</div>
    </div>
  );
}

export default function ROIPage() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
          Proven ROI
        </h1>
        <p className="mt-4 max-w-2xl text-white/70">
          EarlyBird answers every call, books appointments, and deflects routine requests—
          converting missed calls into revenue and lowering support costs.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Stat label="Typical cost/booking" value="$5–$12" />
          <Stat label="Self-serve deflection" value="60–85%" />
          <Stat label="Coverage" value="24/7" />
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-medium">Savings model</h2>
            <ul className="mt-3 list-disc pl-5 text-white/80">
              <li>Reduce missed-call churn and voicemail backlogs.</li>
              <li>Shorter average handle time for common questions.</li>
              <li>Lower after-hours staffing needs.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-medium">Revenue lift</h2>
            <ul className="mt-3 list-disc pl-5 text-white/80">
              <li>Higher booking rates from instant responses.</li>
              <li>Better lead qualification and routing.</li>
              <li>No more lost weekend or evening inquiries.</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-medium">Back-of-the-napkin calc</h2>
          <p className="mt-3 text-white/80">
            Example: If you recover 10 missed bookings/month worth \$150 each,
            that’s \$1,500 added revenue. With an effective \$5–\$12 per booking,
            your monthly net easily clears costs.
          </p>
        </div>

        <div className="mt-10">
          <a href="/pricing" className="inline-block rounded-xl bg-white px-5 py-3 font-medium text-black">
            See Pricing
          </a>
          <a href="/signup" className="ml-3 inline-block rounded-xl border border-white/20 px-5 py-3 text-white/80 hover:text-white">
            Start Free
          </a>
        </div>
      </section>
    </main>
  );
}
