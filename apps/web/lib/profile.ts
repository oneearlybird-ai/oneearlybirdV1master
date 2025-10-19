export type BasicProfile = {
  firstName?: unknown;
  lastName?: unknown;
};

export function hasCompletedName(profile: BasicProfile | null | undefined): boolean {
  if (!profile) return false;
  const first = (profile.firstName ?? "").toString().trim();
  const last = (profile.lastName ?? "").toString().trim();
  return first.length > 0 && last.length > 0;
}
