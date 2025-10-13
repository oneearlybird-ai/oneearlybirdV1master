export type PlanDefinition = {
  slug: string;
  name: string;
  priceCents: number;
  includedMinutes: number;
  trialAvailable: boolean;
  trialMinutes: number;
  overagePerMinute: string;
  priceId: string;
  features: string[];
  popular?: boolean;
  tag?: string;
  blurb?: string;
};

const DOLLAR_FORMAT = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const makePlan = (definition: PlanDefinition) => Object.freeze(definition);

const PLAN_CATALOG: ReadonlyArray<PlanDefinition> = [
  makePlan({
    slug: "starter",
    name: "Starter",
    priceCents: 14900,
    includedMinutes: 200,
    trialAvailable: true,
    trialMinutes: 100,
    overagePerMinute: "$0.90",
    priceId: "price_1SGUCfBKEf4BPnHSYDX9Onnt",
    blurb: "Best for testing and small teams getting started quickly.",
    features: [
      "200 included minutes per month",
      "Core routing & FAQs",
      "Email transcripts & history",
      "Community support",
    ],
  }),
  makePlan({
    slug: "professional",
    name: "Professional",
    priceCents: 24900,
    includedMinutes: 400,
    trialAvailable: true,
    trialMinutes: 100,
    overagePerMinute: "$0.90",
    priceId: "price_1SHGeiBKEf4BPnHSO0LwltzU",
    blurb: "Adds analytics and multi-calendar scheduling for growing teams.",
    features: [
      "400 included minutes per month",
      "Multi-calendar scheduling",
      "CRM sync & advanced analytics",
      "Priority support",
    ],
    popular: true,
  }),
  makePlan({
    slug: "growth",
    name: "Growth",
    priceCents: 39900,
    includedMinutes: 800,
    trialAvailable: true,
    trialMinutes: 100,
    overagePerMinute: "$0.90",
    priceId: "price_1SGUCfBKEf4BPnHSidXOA9Cr",
    blurb: "Ideal for high volume teams needing live transfer and onboarding.",
    features: [
      "800 included minutes per month",
      "Team routing & live transfer",
      "Advanced analytics & integrations",
      "Dedicated onboarding & support",
    ],
    tag: "Most popular",
  }),
  makePlan({
    slug: "enterprise",
    name: "Enterprise",
    priceCents: 89900,
    includedMinutes: 2000,
    trialAvailable: true,
    trialMinutes: 100,
    overagePerMinute: "$0.90",
    priceId: "price_1SGUCfBKEf4BPnHS6h7JLl0t",
    blurb: "Compliance-ready with SSO, integrations, and dedicated success.",
    features: [
      "2000 included minutes per month",
      "SSO, audit logs, compliance",
      "Custom integrations",
      "Dedicated success manager & SLAs",
    ],
  }),
] as const;

export const PLAN_DEFINITIONS = PLAN_CATALOG;
export const PLAN_BY_PRICE_ID = new Map(PLAN_CATALOG.map((plan) => [plan.priceId, plan]));
export const PLAN_BY_SLUG = new Map(PLAN_CATALOG.map((plan) => [plan.slug, plan]));

export function getPlanPriceLabel(plan: PlanDefinition): string {
  return `${DOLLAR_FORMAT.format(plan.priceCents / 100)}/mo`;
}

export function getPlanTrialBadge(plan: PlanDefinition): string | null {
  if (!plan.trialAvailable) return null;
  return `14-day trial • ${plan.trialMinutes} minutes`;
}
