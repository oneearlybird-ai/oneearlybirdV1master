export type PlanSlug = 'starter' | 'professional' | 'growth' | 'enterprise';
export type MinutePlan = {
  slug: PlanSlug;
  name: string;
  monthlyPrice: number; // dollars
  includedMinutes: number;
  priceNickname?: string;
  stripePriceId?: string;
  summary: string;
  features: string[];
  ctaHref: string;
};

export const PLANS: MinutePlan[] = [
  {
    slug: 'starter',
    name: 'Starter',
    monthlyPrice: 149,
    includedMinutes: 200,
    priceNickname: 'Starter / 200 min',
    summary: 'Perfect for testing and small teams',
    features: [
      '200 minutes included',
      'Up to 2 numbers connected',
      'Basic routing & FAQs',
      'Email transcripts',
    ],
    ctaHref: '/signup',
  },
  {
    slug: 'professional',
    name: 'Professional',
    monthlyPrice: 249,
    includedMinutes: 400,
    priceNickname: 'Professional / 400 min',
    summary: 'For teams scaling beyond pilot phase',
    features: [
      '400 minutes included',
      'Up to 5 numbers connected',
      'Improved routing & transfers',
      'Email summaries & transcripts',
    ],
    ctaHref: '/signup',
  },
  {
    slug: 'growth',
    name: 'Growth',
    monthlyPrice: 399,
    includedMinutes: 800,
    priceNickname: 'Growth / 800 min',
    summary: 'Best for growing businesses',
    features: [
      '800 minutes included',
      'Up to 10 numbers connected',
      'Scheduling across Google/Microsoft',
      'Dashboard recordings & analytics',
    ],
    ctaHref: '/signup',
  },
  {
    slug: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 899,
    includedMinutes: 2000,
    priceNickname: 'Enterprise / 2000 min',
    summary: 'Compliance, SSO, and onboarding',
    features: [
      '2000 minutes included (custom overages)',
      'Unlimited numbers & custom routing',
      'SLA, SSO, audit logs',
      'Dedicated success manager',
    ],
    ctaHref: '/signup',
  },
];

export function formatPrice(dollars: number, minutes: number): string {
  const price = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(dollars);
  return `${price}/mo (${minutes.toLocaleString()} min)`;
}
