import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proven ROI – EarlyBird",
  description: "Estimate savings, deflection, and effective cost per booking with EarlyBird.",
};

export default function ROI() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Proven ROI</h1>
        <nav className="mt-3 text-sm text-white/70" aria-label="On this page">
          <a className="underline mr-4" href="#stats">Key results</a>
          <a className="underline" href="#assumptions">Assumptions</a>
        </nav>
        <p className="mt-3 max-w-2xl text-white/70">
          Typical deployments see 60–85% deflection to self-serve, $5–$12 effective cost per booking,
          and 24/7 coverage with an on-brand voice.
        </p>

        <div id="stats" className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 p-6">
            <div className="text-3xl font-semibold">$5–$12</div>
            <div className="mt-1 text-sm text-white/70">effective cost per booking</div>
          </div>
          <div className="rounded-2xl border border-white/10 p-6">
            <div className="text-3xl font-semibold">60–85%</div>
            <div className="mt-1 text-sm text-white/70">deflection to self-serve</div>
          </div>
          <div className="rounded-2xl border border-white/10 p-6">
            <div className="text-3xl font-semibold">24/7</div>
            <div className="mt-1 text-sm text-white/70">coverage with on-brand voice</div>
          </div>
        </div>

        <section id="assumptions" className="mt-10 max-w-2xl">
          <h2 className="text-xl font-medium">Assumptions</h2>
          <ul className="mt-3 list-disc pl-5 text-white/80 space-y-1">
            <li>Typical SMB inbound mix with repeat FAQs and scheduling requests</li>
            <li>Deflection includes voicemail avoidance and self-serve routing</li>
            <li>Usage-based billing; telephony included, one Stripe invoice</li>
          </ul>
        </section>
      </section>
    </main>
  );
}
