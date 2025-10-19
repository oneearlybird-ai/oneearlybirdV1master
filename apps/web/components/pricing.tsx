'use client';

import PlanCheckoutButtons from "@/components/PlanCheckoutButtons";
import { PLAN_DEFINITIONS, getPlanPriceLabel, getPlanTrialBadge } from "@/lib/plans";

type DerivedPlan = {
  id: string;
  name: string;
  blurb: string;
  priceLabel: string;
  trialBadge: string | null;
  features: string[];
  highlight: boolean;
  tag?: string;
  priceId: string;
  allowTrial: boolean;
  hasPriceId: boolean;
};

const marketingPlans: DerivedPlan[] = PLAN_DEFINITIONS.filter((plan) => plan.slug !== "enterprise").map((plan) => {
  const priceLabel = getPlanPriceLabel(plan);
  const trialBadge = getPlanTrialBadge(plan);
  const hasPriceId = typeof plan.priceId === "string" && plan.priceId.trim().length > 0;
  const allowTrial = plan.trialAvailable && plan.trialMinutes > 0 && hasPriceId;
  return {
    id: plan.slug,
    name: plan.name,
    blurb: plan.blurb ?? "",
    priceLabel,
    trialBadge,
    features: plan.features,
    highlight: plan.popular === true || typeof plan.tag === "string",
    tag: plan.tag,
    priceId: plan.priceId,
    allowTrial,
    hasPriceId,
  };
});

export default function Pricing() {
  return (
    <div className="relative">
      <div
        className="max-md:hidden absolute bottom-0 -mb-20 left-2/3 -translate-x-1/2 blur-2xl opacity-70 pointer-events-none"
        aria-hidden="true"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="434" height="427">
          <defs>
            <linearGradient id="pricing-glow" x1="19.609%" x2="50%" y1="14.544%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path fill="url(#pricing-glow)" fillRule="evenodd" d="m661 736 461 369-284 58z" transform="matrix(1 0 0 -1 -661 1163)" />
        </svg>
      </div>

      <div className="grid gap-6 md:grid-cols-4 xl:-mx-6 text-sm">
        <div
          className="flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-800/25 px-6 py-6 transition duration-200 hover:border-purple-400/60 hover:bg-slate-800/40"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          <div>
            <p className="text-sm font-semibold text-slate-200">Simple monthly plans</p>
            <p className="mt-3 text-sm text-slate-400">
              Pick a plan that matches your call volume. Every tier includes the same security posture, live receptionist, and proactive call handling.
            </p>
          </div>
          <ul className="mt-6 space-y-2 text-sm text-slate-300">
            <li className="flex items-center gap-2">
              <CheckIcon />
              <span>Live receptionist coverage from day one</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon />
              <span>Usage alerts at 50 / 80 / 95% of your minutes</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon />
              <span>Move between tiers whenever you need</span>
            </li>
          </ul>
        </div>

        {marketingPlans.map((plan, index) => {
          const purchaseDisabled = !plan.hasPriceId || plan.allowTrial;
          return (
            <div
              key={plan.id}
              className={`flex flex-col justify-between rounded-3xl border px-6 py-6 transition duration-200 ${
                plan.highlight
                  ? "border-purple-400/60 bg-purple-500/10 shadow-[0_20px_60px_rgba(102,51,153,0.25)]"
                  : "border-slate-800 bg-slate-800/20 hover:border-purple-400/60 hover:bg-slate-800/40"
              }`}
              data-aos="fade-up"
              data-aos-delay={150 + index * 80}
            >
              <div className="grow">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-base font-medium bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-purple-100 pb-0.5">
                    {plan.name}
                  </div>
                  {plan.tag ? (
                    <span className="inline-flex items-center rounded-full border border-purple-400/60 bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-100">
                      {plan.tag}
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 text-3xl font-semibold text-slate-50">{plan.priceLabel}</div>
                {plan.trialBadge ? <div className="mt-2 text-xs font-medium uppercase tracking-wide text-purple-200">{plan.trialBadge}</div> : null}
                <p className="mt-3 text-sm text-slate-300">{plan.blurb}</p>
                <ul className="mt-5 space-y-2 text-slate-200">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-100">
                      <CheckIcon />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6">
                <PlanCheckoutButtons
                  className="gap-2"
                  priceId={plan.priceId}
                  planName={plan.name}
                  allowTrial={plan.allowTrial}
                  disableTrial={!plan.allowTrial}
                  disablePurchase={purchaseDisabled}
                  purchaseLabel="Select plan"
                  trialLabel="Start free trial"
                />
                {!plan.hasPriceId ? (
                  <p className="mt-2 text-xs text-slate-400">Set the Stripe price IDs in the environment to enable checkout.</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-purple-300" xmlns="http://www.w3.org/2000/svg" width="12" height="9" fill="currentColor">
      <path d="M10.28.28 3.989 6.575 1.695 4.28A1 1 0 0 0 .28 5.695l3 3a1 1 0 0 0 1.414 0l7-7A1 1 0 0 0 10.28.28Z" />
    </svg>
  );
}
