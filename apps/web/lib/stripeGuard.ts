const PHI_FIELDS = /(mrn|diagnosis|ssn|dob|patient|phi)/i;
export function assertStripeMetadataPHIZero(meta: Record<string, any> = {}) {
  const payload = JSON.stringify(meta || {});
  if (PHI_FIELDS.test(payload)) {
    throw new Error("PHI-like content detected in Stripe metadata");
  }
}
