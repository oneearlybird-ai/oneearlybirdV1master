export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "").replace(/\/+$/, "");

const PRICE_IDS = {
  starter: (process.env.NEXT_PUBLIC_PRICE_ESSENTIAL ?? "").trim(),
  professional: (process.env.NEXT_PUBLIC_PRICE_PRO ?? "").trim(),
  growth: (process.env.NEXT_PUBLIC_PRICE_GROWTH ?? "").trim(),
  enterprise: (process.env.NEXT_PUBLIC_PRICE_ENTERPRISE ?? "").trim(),
} as const;

export function getPriceId(slug: keyof typeof PRICE_IDS): string {
  return PRICE_IDS[slug];
}
