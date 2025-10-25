import type { TenantProfile } from "@/components/auth/AuthSessionProvider";

export function isTenantActive(profile: TenantProfile | null | undefined): boolean {
  if (!profile) return false;
  if (profile.agentEnabled === true) return true;
  if (typeof profile.planKey === "string" && profile.planKey.length > 0) return true;
  if (typeof profile.planPriceId === "string" && profile.planPriceId.length > 0) return true;
  if (typeof profile.accountNumber === "string" && profile.accountNumber.length > 0) return true;
  if (profile.businessProfileComplete === true) return true;
  if (typeof profile.did === "string" && profile.did.length > 0) return true;
  return false;
}
