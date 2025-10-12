export type PlanDefinition = {
  slug: string;
  name: string;
  priceLabel: string;
  blurb?: string;
  features: string[];
  priceId: string;
  tag?: string;
  popular?: boolean;
};

export const PLAN_DEFINITIONS: PlanDefinition[] = [
  {
    slug: "starter",
    name: "Starter",
    priceLabel: "$0 + usage",
    blurb: "Perfect for testing and small teams",
    priceId: "price_1SGUCfBKEf4BPnHSYDX9Onnt",
    features: [
      "Up to 2 numbers connected",
      "Basic routing & FAQs",
      "Email transcripts",
      "Community support",
    ],
  },
  {
    slug: "growth",
    name: "Growth",
    priceLabel: "$99/mo + usage",
    blurb: "Best for growing businesses",
    popular: true,
    priceId: "price_1SGUCfBKEf4BPnHSidXOA9Cr",
    features: [
      "Up to 10 numbers connected",
      "Scheduling across Google/Microsoft",
      "Advanced routing & transfers",
      "Dashboard, recordings, analytics",
      "Priority support",
    ],
  },
  {
    slug: "professional",
    name: "Professional",
    priceLabel: "$199/mo + usage",
    blurb: "For teams scaling to high volume",
    tag: "Most popular",
    priceId: "price_1SHGeiBKEf4BPnHSO0LwltzU",
    features: [
      "Up to 25 numbers connected",
      "Premium voice & routing",
      "Calendar booking across teams",
      "CRM sync & advanced analytics",
      "Priority support",
    ],
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    priceLabel: "Talk to us",
    blurb: "Compliance, SSO, and onboarding",
    priceId: "price_1SGUCfBKEf4BPnHS6h7JLl0t",
    features: [
      "SLA, SSO, audit logs",
      "Custom integrations",
      "DPA/SOC 2 readiness",
      "Dedicated success manager",
    ],
  },
];

export const PLAN_BY_PRICE_ID = new Map(
  PLAN_DEFINITIONS.map((plan) => [plan.priceId, plan])
);

export const PLAN_BY_SLUG = new Map(
  PLAN_DEFINITIONS.map((plan) => [plan.slug, plan])
);
