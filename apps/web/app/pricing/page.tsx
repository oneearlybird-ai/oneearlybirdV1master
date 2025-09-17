import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing – EarlyBird",
  description: "Simple, transparent pricing for AI voice reception.",
};

function Tier({
  name,
  price,
  blurb,
  ctaHref,
  features,
  popular = false,
}: {
  name: string;
  price: string;
  blurb: string;
  ctaHref: string;
  features: string[];
  popular?: boolean;
}) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  function featureHint(f: string): string | null {
    const s = f.toLowerCase();
    if (s.includes('premium voice')) return 'Higher‑quality voice output and configuration.';
    if (s.includes('calendar')) return 'Google and Microsoft calendars supported.';
    if (s.includes('crm')) return 'Works with HubSpot and Salesforce.';
    if (s.includes('analytics')) return 'Enhanced usage insights and summaries.';
    if (s.includes('priority routing')) return 'Lower latency routes during peak times.';
    return null;
  }
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col ${popular ? "outline outline-1 outline-white/20" : ""}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{name}</h3>
        {popular ? (
          <span className="text-xs rounded-full border border-white/15 bg-white/10 px-2 py-1">
            Most popular
          </span>
        ) : null}
      </div>
      <div className="mt-3 text-3xl font-semibold">{price}</div>
      <p className="mt-2 text-sm text-white/70">{blurb}</p>
      <ul className="mt-6 space-y-2 text-sm text-white/80">
        {features.map((f, i) => {
          const id = `feat-${slug}-${i}`;
          const hint = featureHint(f);
          return (
            <li key={f} className="flex gap-2">
              <span aria-hidden>✓</span>
              <span {...(hint ? { title: hint, 'aria-describedby': id } : {})}>{f}</span>
              {hint ? <span id={id} className="sr-only">{hint}</span> : null}
            </li>
          );
        })}
      </ul>
      <p id={`tier-desc-${slug}`} className="sr-only">Managed telephony included; one invoice via Stripe.</p>
      <Link
        href={ctaHref}
        className="mt-6 inline-block rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90 text-center"
        aria-label={`Get started with the ${name} plan`}
        aria-describedby={`tier-desc-${slug}`}
      >
        Get started
      </Link>
    </div>
  );
}

export default function Page() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
          Pricing that scales with you
        </h1>
        <p className="mt-4 max-w-2xl text-white/70">
          Start in minutes. Pay as you go for usage, with predictable caps and
          clean billing. No contracts required.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Tier
            name="Starter"
            price="$0 + usage"
            blurb="Perfect for testing and small teams"
            ctaHref="/signup"
            features={[
              "Up to 2 numbers connected",
              "Basic routing & FAQs",
              "Email transcripts",
              "Community support",
            ]}
          />
          <Tier
            name="Growth"
            price="$99/mo + usage"
            blurb="Best for growing businesses"
            ctaHref="/signup"
            popular
            features={[
              "Up to 10 numbers connected",
              "Scheduling across Google/Microsoft",
              "Advanced routing & transfers",
              "Dashboard, recordings, analytics",
              "Priority support",
            ]}
          />
          <Tier
            name="Enterprise"
            price="Talk to us"
            blurb="Compliance, SSO, and onboarding"
            ctaHref="/support"
            features={[
              "SLA, SSO, audit logs",
              "Custom integrations",
              "DPA/SOC 2 readiness",
              "Dedicated success manager",
            ]}
          />
        </div>

        <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-medium">Usage pricing</h2>
          <p className="mt-2 text-sm text-white/70">
            Usage billed per minute with transparent margins. Typical effective
            cost per booking is $5–$12 depending on call length and volume.
          </p>
          <p className="mt-3 text-sm text-white/70">
            Telephony included — no separate carrier account required. One invoice via Stripe.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <h2 className="text-lg font-medium">Need help choosing a plan?</h2>
          <div className="mt-3 flex justify-center gap-3">
            <a href="/support" className="btn btn-outline">Talk to us</a>
            <a href="mailto:support@earlybird.ai" className="btn btn-primary">Email support</a>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-medium">FAQ</h2>
          <dl className="mt-3 space-y-3 text-sm text-white/80">
            <div>
              <dt className="font-medium">Do I need a Twilio account?</dt>
              <dd className="text-white/70">No. We manage telephony for you. You can also <a className="underline" href="/support/porting">port your existing number</a>.</dd>
            </div>
            <div>
              <dt className="font-medium">How am I billed?</dt>
              <dd className="text-white/70">One invoice via Stripe that includes platform and usage fees.</dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  );
}
