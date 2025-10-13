import {
  PLAN_DEFINITIONS,
  PLAN_BY_PRICE_ID,
  type PlanDefinition,
  getPlanPriceLabel,
} from "@/lib/plans";

export type PlanSummaryLike = {
  status: "none" | "trial-active" | "active";
  planKey: string | null;
  planPriceId: string | null;
  planMinutes?: number | null;
  minutesCap?: number | null;
  trialEnd?: string | null;
  hasPaymentMethod?: boolean | null;
};

export type PlanProfileLike = {
  planKey?: string | null;
  planPriceId?: string | null;
};

function normalizePlanKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}

export function humanizePlanKey(input: string | null | undefined): string | null {
  if (!input) return null;
  return input
    .toString()
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function findPlanDefinition(planKey: string | null | undefined, planPriceId: string | null | undefined): PlanDefinition | null {
  if (planPriceId && PLAN_BY_PRICE_ID.has(planPriceId)) {
    return PLAN_BY_PRICE_ID.get(planPriceId) || null;
  }
  if (!planKey) return null;
  const normalized = normalizePlanKey(planKey);
  const bySlug = PLAN_DEFINITIONS.find((plan) => plan.slug === normalized);
  if (bySlug) return bySlug;
  const byName = PLAN_DEFINITIONS.find((plan) => plan.name.toLowerCase() === planKey.toLowerCase());
  if (byName) return byName;
  const fuzzy = PLAN_DEFINITIONS.find((plan) => normalized.includes(plan.slug));
  return fuzzy || null;
}

export function formatIsoDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function derivePlanDisplay(
  summary: PlanSummaryLike | null | undefined,
  profile: PlanProfileLike | null | undefined,
): { value: string; hint?: string } {
  if (!summary) {
    const definition = findPlanDefinition(profile?.planKey ?? null, profile?.planPriceId ?? null);
    if (!definition) {
      return { value: "No plan yet" };
    }
    return {
      value: definition.name,
      hint: getPlanPriceLabel(definition),
    };
  }

  if (summary.status === "none") {
    return { value: "No plan yet" };
  }

  if (summary.status === "trial-active") {
    const cap = summary.minutesCap ?? 100;
    const capLabel = `${cap}-minute cap`;
    const end = formatIsoDate(summary.trialEnd);
    const value = end ? `Trial (${capLabel}) ends ${end}` : `Trial (${capLabel})`;
    return { value };
  }

  const definition = findPlanDefinition(summary.planKey ?? null, summary.planPriceId ?? null);
  const fallbackName = humanizePlanKey(summary.planKey) || "Active plan";
  const minutes = summary.planMinutes ?? summary.minutesCap ?? null;
  const name = definition?.name || fallbackName;
  const value = minutes ? `${name} • ${minutes} min/mo` : name;
  const hint =
    (definition && getPlanPriceLabel(definition)) ||
    (summary.hasPaymentMethod ? "Payment method on file" : undefined);
  return { value, hint };
}
