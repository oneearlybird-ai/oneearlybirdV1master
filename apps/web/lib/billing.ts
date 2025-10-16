import {
  PLAN_DEFINITIONS,
  PLAN_BY_PRICE_ID,
  type PlanDefinition,
  getPlanPriceLabel,
} from "@/lib/plans";

export type PlanSummaryLike = {
  status: "none" | "trial-active" | "trial-cancelled" | "active";
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
  const planDefinition = findPlanDefinition(
    summary?.planKey ?? profile?.planKey ?? null,
    summary?.planPriceId ?? profile?.planPriceId ?? null,
  );
  const includedMinutes = planDefinition?.includedMinutes ?? null;
  if (!summary) {
    if (!planDefinition) {
      return { value: "No plan yet" };
    }
    return {
      value: includedMinutes ? `${planDefinition.name} • ${includedMinutes} min/mo` : planDefinition.name,
      hint: getPlanPriceLabel(planDefinition),
    };
  }

  if (summary.status === "none") {
    return { value: "No current plan", hint: "Choose a plan to get started." };
  }

  if (summary.status === "trial-cancelled") {
    const end = formatIsoDate(summary.trialEnd);
    return {
      value: end ? `Trial ends ${end}` : "Trial cancelled",
      hint: "Activate a plan to keep service running.",
    };
  }

  if (summary.status === "trial-active") {
    const trialMinutes = planDefinition?.trialMinutes ?? summary.minutesCap ?? 100;
    const capLabel = `${trialMinutes}-minute cap`;
    const end = formatIsoDate(summary.trialEnd);
    const value = end ? `Trial (${capLabel}) ends ${end}` : `Trial (${capLabel})`;
    return { value };
  }

  const fallbackName = humanizePlanKey(summary.planKey) || "Active plan";
  const name = planDefinition?.name || fallbackName;
  const value = includedMinutes ? `${name} • ${includedMinutes} min/mo` : name;
  const hint =
    (planDefinition && getPlanPriceLabel(planDefinition)) ||
    (summary.hasPaymentMethod ? "Payment method on file" : undefined);
  return { value, hint };
}
