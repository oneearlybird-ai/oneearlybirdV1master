export function maskAccountNumber(value: string | null | undefined): string | null {
  if (!value) return null;
  const cleaned = value.replace(/[^0-9A-Za-z]/g, "").toUpperCase();
  if (cleaned.length < 6) return `EB-${cleaned}`;
  const prefix = cleaned.slice(0, 2);
  const middle = "••••";
  const suffix = cleaned.slice(-4);
  return `EB-${prefix}${middle}-${suffix}`;
}

export function fallbackNameFromEmail(email?: string | null): string {
  if (!email) return "there";
  const local = email.split("@")[0] ?? "";
  return local || "there";
}

export function formatE164Input(value: string): string {
  let digits = value.replace(/[^\d+]/g, "");
  if (!digits.startsWith("+")) {
    digits = `+${digits.replace(/^\+/, "")}`;
  }
  return digits.replace(/\s+/g, "");
}

export function formatDisplayPhone(e164: string | null | undefined): string {
  if (!e164) return "";
  const digits = e164.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    const area = digits.slice(1, 4);
    const mid = digits.slice(4, 7);
    const last = digits.slice(7);
    return `+1 (${area}) ${mid}-${last}`;
  }
  if (digits.length === 10) {
    const area = digits.slice(0, 3);
    const mid = digits.slice(3, 6);
    const last = digits.slice(6);
    return `(${area}) ${mid}-${last}`;
  }
  return e164;
}

export function formatAddressLine(address?: {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  region?: string | null;
  postal?: string | null;
  country?: string | null;
} | null): string {
  if (!address) return "";
  const parts = [
    address.line1,
    address.line2 && address.line2.trim().length > 0 ? address.line2 : null,
    [address.city, address.region].filter(Boolean).join(", "),
    address.postal,
    address.country,
  ]
    .filter(Boolean)
    .map((part) => part?.toString().trim())
    .filter((part) => part);
  return parts.join(" • ");
}
