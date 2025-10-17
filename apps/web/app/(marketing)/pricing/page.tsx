import type { Metadata } from "next";
import PlanCheckoutButtons from "@/components/PlanCheckoutButtons";
import Section from "@/components/stellar/Section";
import {
  PLAN_DEFINITIONS,
  PLAN_BY_PRICE_ID,
  PLAN_BY_SLUG,
  type PlanDefinition,
  getPlanPriceLabel,
  getPlanTrialBadge,
} from "@/lib/plans";
import { serverApiFetch } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Pricing",
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

type TenantProfile = {
  planKey?: string | null;
  planPriceId?: string | null;
};

type BillingSummary = {
  status?: string | null;
  planKey?: string | null;
  planPriceId?: string | null;
  trialEligible?: boolean | null;
};

function Tier({
  plan,
  planStatus,
  activePlanSlug,
  showTrialMarketing = true,
}: {
  plan: PlanDefinition;
  planStatus?: string | null;
  activePlanSlug?: string | null;
  showTrialMarketing?: boolean;
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
    <div
      className={`flex flex-col gap-6 rounded-3xl border border-white/12 bg-white/5 p-8 shadow-[0_36px_100px_rgba(8,9,20,0.45)] transition hover:border-white/25 ${
        popular ? "outline outline-1 outline-white/25" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-white">{name}</h3>
          {blurb ? <p className="mt-2 text-sm text-white/70">{blurb}</p> : null}
        </div>
        {popular ? (
          <span className="rounded-full border border-amber-400/40 bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-100">
            Most popular
          </span>
        ) : null}
      </div>
      <div>
        <div className="text-4xl font-semibold text-white">{priceLabel}</div>
        <p className="mt-2 text-xs uppercase tracking-wide text-white/55">
        {includedMinutes.toLocaleString()} min included • {overagePerMinute}/min overage
      </p>
        {trialAvailable && trialBadge && showTrialMarketing ? (
          <p className="mt-3 inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
            {trialBadge}
          </p>
        ) : null}
      </div>
      <ul className="mt-4 space-y-2 text-sm text-white/80">
        {features.map((f, i) => {
          const id = `feat-${slug}-${i}`;
          const hint = featureHint(f);
          return (
            <li key={f} className="flex items-start gap-3">
              <span
                aria-hidden
                className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-emerald-200"
              >
                ✓
              </span>
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
        className="mt-4"
        priceId={priceId}
        planName={name}
        allowTrial={showTrialMarketing && trialAvailable}
        disableTrial={
          !showTrialMarketing ||
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
  let planStatus: string | null = stripePlan?.plan?.status || null;
  let planPriceId: string | null = stripePlan?.plan?.price_id || null;
  let activePlanSlug =
    (planPriceId && PLAN_BY_PRICE_ID.get(planPriceId)?.slug) || null;
  let trialEligible: boolean | null | undefined;
  try {
    const profileResponse = await serverApiFetch("/tenants/profile");
    if (profileResponse.status === 200) {
      const profile = (await profileResponse.json()) as TenantProfile;
      const summaryResponse = await serverApiFetch("/billing/summary");
      if (summaryResponse.ok) {
        const summary = (await summaryResponse.json()) as BillingSummary;
        trialEligible = summary.trialEligible ?? null;
        planStatus = summary.status ?? planStatus ?? null;
        if (summary.planPriceId) {
          planPriceId = summary.planPriceId;
        } else if (summary.planKey) {
          const derivedFromKey = PLAN_BY_SLUG.get(summary.planKey);
          planPriceId = derivedFromKey?.priceId ?? planPriceId;
        }
      } else if (summaryResponse.status === 401) {
        trialEligible = undefined;
      }
      if (!planPriceId) {
        planPriceId = profile.planPriceId ?? null;
      }
      if (!planPriceId && profile.planKey) {
        const derivedFromProfileKey = PLAN_BY_SLUG.get(profile.planKey);
        planPriceId = derivedFromProfileKey?.priceId ?? null;
      }
    } else if (profileResponse.status === 401) {
      trialEligible = undefined;
    }
  } catch (error) {
    console.warn("pricing_fetch_state_failed", {
      message: error instanceof Error ? error.message : "unknown_error",
    });
  }
  activePlanSlug =
    (planPriceId && PLAN_BY_PRICE_ID.get(planPriceId)?.slug) || activePlanSlug;
  const showTrialMarketing = trialEligible !== false;

  return (
    <div className="flex flex-col">
      <section className="px-5 pt-20 pb-12 sm:px-6 md:pt-28">
        <div className="mx-auto max-w-4xl text-center">
          <span className="stellar-pill">Transparent pricing</span>
          <h1 className="mt-6 text-4xl font-semibold text-white md:text-5xl">
            Choose the plan that matches your call volume today—scale anytime.
          </h1>
          <p className="mt-6 text-base text-white/70 md:text-lg">
            Every plan includes secure call handling, live analytics, and access to our mobile dashboard. Upgrade or downgrade on your schedule;
            unused minutes roll forward automatically.
          </p>
        </div>
      </section>

      <Section
        eyebrow="Monthly plans"
        title="Coverage that grows with you."
        description="Launch with the minutes you need today. Each plan retains our cookie-auth model, header contract, and bottom-nav parity across web and mobile."
        className="pt-0"
      >
        <div className="grid gap-6 md:grid-cols-3">
          {PLAN_DEFINITIONS.filter((plan) => plan.slug !== "enterprise").map((plan) => (
            <Tier
              key={plan.slug}
              plan={plan}
              planStatus={planStatus}
              activePlanSlug={activePlanSlug ?? undefined}
              showTrialMarketing={showTrialMarketing}
            />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="FAQs"
        title="Pricing clarity, zero surprises."
        description="If procurement needs custom paperwork or minute bundles, let us know. Our auth/session guarantees never change."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="stellar-grid-card bg-white/5">
            <h3 className="text-lg font-semibold text-white">Can I adjust plans later?</h3>
            <p className="mt-3 text-sm text-white/70">
              Yes. Upgrades take effect immediately with prorated billing. Downgrades apply at the next renewal—no penalties or hidden fees.
            </p>
          </div>
          <div className="stellar-grid-card bg-white/5">
            <h3 className="text-lg font-semibold text-white">What about overage minutes?</h3>
            <p className="mt-3 text-sm text-white/70">
              We bill overages at the published rate and send alerts long before you hit your included minutes. Your transcripts and analytics keep
              flowing with no throttling.
            </p>
          </div>
          <div className="stellar-grid-card bg-white/5">
            <h3 className="text-lg font-semibold text-white">Do you offer annual pricing?</h3>
            <p className="mt-3 text-sm text-white/70">
              Professional and Growth tiers support annual billing with preferred pricing. We include SLA commitments, DPA, and SOC 2 documentation.
            </p>
          </div>
          <div className="stellar-grid-card bg-white/5">
            <h3 className="text-lg font-semibold text-white">Need something custom?</h3>
            <p className="mt-3 text-sm text-white/70">
              Enterprise coverage adds SSO, audit logs, and custom integrations. Email{" "}
              <a href="mailto:hello@oneearlybird.ai" className="underline decoration-dotted underline-offset-4">
                hello@oneearlybird.ai
              </a>{" "}
              and we’ll tailor rollout and pricing.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
