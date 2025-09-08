import { isPublicZone } from "./config/swap";
const PHI_REGEX = /(mrn|medical record|diagnosis|ssn|dob|patient id|phi)/i;
export function assertPhiZeroPayload(body: unknown) {
  if (!isPublicZone) return;
  const s = typeof body === "string" ? body : JSON.stringify(body ?? {});
  if (PHI_REGEX.test(s)) throw new Error("Potential PHI detected in public zone payload");
}
