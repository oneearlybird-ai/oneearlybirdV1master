import type { Metadata } from "next";
import PlanCheckoutButtons from "@/components/PlanCheckoutButtons";
import {
  PLAN_DEFINITIONS,
  PLAN_BY_PRICE_ID,
  type PlanDefinition,
  getPlanPriceLabel,
  getPlanTrialBadge,
} from "@/lib/plans";

export const metadata: Metadata = {
  title: "Pricing – EarlyBird",
  description: "Simple, transparent pricing for AI voice reception.",
};

async function fetchStripePlan() {
  try {
    const res = await fetch("/api/stripe/usage", { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function Tier({
  plan,
  planStatus,
  activePlanSlug,
}: {
  plan: PlanDefinition;
  planStatus?: string | null;
  activePlanSlug?: string | null;
}) {
  const {
    name,
    blurb,
    features,
    popular,
    priceId,
    includedMinutes,
    overagePerMinute,
    trialAvailable,
  } = plan;
  const priceLabel = getPlanPriceLabel(plan);
  const trialBadge = getPlanTrialBadge(plan);
  const slug = plan.slug;
  function featureHint(f: string): string | null {
    const s = f.toLowerCase();
    if (s.includes('premium voice')) return 'Higher‑quality voice output and configuration.';
    if (s.includes('calendar')) return 'Google and Microsoft calendars supported.';
    if (s.includes('crm')) return 'Works with HubSpot and Salesforce.';
    if (s.includes('analytics')) return 'Enhanced usage insights and summaries.';
    if (s.includes('priority routing')) return 'Lower latency routes during peak times.';
    if (s.includes('email summaries')) return 'Daily or per‑call email summaries (no PHI).';
    if (s.includes('sla') || s.includes('sso')) return 'Enterprise: SLA commitments and single sign‑on.';
    if (s.includes('dedicated support')) return 'Priority support with faster response times.';
    if (s.includes('custom integrations')) return 'We can integrate with tools beyond listed providers.';
    if (s.includes('dpa') || s.includes('soc 2')) return 'Enterprise data processing addendum and SOC 2 readiness.';
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
      <div className="mt-3 text-3xl font-semibold">{priceLabel}</div>
      {blurb ? <p className="mt-2 text-sm text-white/70">{blurb}</p> : null}
      <p className="mt-2 text-xs uppercase tracking-wide text-white/50">
        {includedMinutes.toLocaleString()} min included • {overagePerMinute}/min overage
      </p>
      {trialAvailable && trialBadge ? (
        <p className="mt-1 inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-200">
          {trialBadge}
        </p>
      ) : null}
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

      <details className="mt-4 text-sm text-white/80">
        <summary className="cursor-pointer select-none">Plan details (coming soon)</summary>
        <div className="mt-2 text-white/60">
          More billing and usage controls will appear here, including minute bundles and overage pricing.
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Monthly billing; usage billed per minute with transparent margins.</li>
            <li>Cancel anytime; no long‑term contracts.</li>
            <li>Managed telephony included — one invoice via Stripe.</li>
          </ul>
        </div>
      </details>
      <p id={`tier-desc-${slug}`} className="sr-only">Managed telephony included; one invoice via Stripe.</p>
      <PlanCheckoutButtons
        className="mt-6"
        priceId={priceId}
        planName={name}
        disableTrial={
          !trialAvailable ||
          planStatus === "trial-active" ||
          planStatus === "active" ||
          planStatus === "trialing"
        }
        disablePurchase={activePlanSlug === slug}
      />
    </div>
  );
}

export default async function Page() {
  const stripePlan = await fetchStripePlan();
  const planStatus: string | null = stripePlan?.plan?.status || null;
  const planPriceId: string | null = stripePlan?.plan?.price_id || null;
  const activePlanSlug =
    (planPriceId && PLAN_BY_PRICE_ID.get(planPriceId)?.slug) || null;

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
          {PLAN_DEFINITIONS.map((plan) => (
            <Tier
              key={plan.slug}
              plan={plan}
              planStatus={planStatus}
              activePlanSlug={activePlanSlug}
            />
          ))}
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
