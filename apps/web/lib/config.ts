function normalizeBase(value?: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim().replace(/\/+$/, "");
  return trimmed.length ? trimmed : undefined;
}

const SITE_BASE =
  normalizeBase(process.env.NEXT_PUBLIC_BASE_URL) ??
  normalizeBase(process.env.NEXT_PUBLIC_SITE_URL);

export const API_BASE = normalizeBase(process.env.NEXT_PUBLIC_API_BASE) ?? "";

const PRICE_IDS = {
  starter: (process.env.NEXT_PUBLIC_PRICE_ESSENTIAL ?? "").trim(),
  professional: (process.env.NEXT_PUBLIC_PRICE_PRO ?? "").trim(),
  growth: (process.env.NEXT_PUBLIC_PRICE_GROWTH ?? "").trim(),
  enterprise: (process.env.NEXT_PUBLIC_PRICE_ENTERPRISE ?? "").trim(),
} as const;

export function getPriceId(slug: keyof typeof PRICE_IDS): string {
  return PRICE_IDS[slug];
}

export function getSiteBaseUrl(): string | undefined {
  return SITE_BASE;
}
