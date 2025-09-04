import Link from "next/link";

export const dynamic = 'force-static';

export default function ROI() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
          ROI Calculator
        </h1>
        <p className="mt-4 max-w-2xl text-white/70">
          Estimate savings from deflecting routine calls and booking more appointments.
          This static preview shows assumptions; the interactive version will ship later.
        </p>

        {/* Assumptions grid (static) */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-white/60">Avg calls / month</div>
            <div className="mt-2 text-3xl font-semibold">1,200</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-white/60">Self-serve deflection</div>
            <div className="mt-2 text-3xl font-semibold">70%</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-white/60">Bookings uplift</div>
            <div className="mt-2 text-3xl font-semibold">+18%</div>
          </div>
        </div>

        {/* Result card (static) */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-white/60">Staff time saved</div>
            <div className="mt-2 text-3xl font-semibold">~85 hrs/mo</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-white/60">Bookings added</div>
            <div className="mt-2 text-3xl font-semibold">~90/mo</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-white/60">Est. net ROI</div>
            <div className="mt-2 text-3xl font-semibold">$8.4k+/mo</div>
          </div>
        </div>

        {/* CTA as a regular link — no onClick */}
        <div className="mt-10 flex gap-3">
          <Link
            href="/pricing"
            className="rounded-xl bg-white px-5 py-3 font-medium text-black"
          >
            See Pricing
          </Link>
          <Link
            href="/support"
            className="rounded-xl border border-white/20 px-5 py-3 font-medium text-white/80 hover:text-white"
          >
            Talk to Sales
          </Link>
        </div>

        <p className="mt-6 text-sm text-white/60">
          Detailed, interactive inputs (AHT, conversion, staffing costs) will be enabled in the client version.
        </p>
      </section>
    </main>
  );
}
