import { API_BASE } from "@/lib/config";

function normalize(base: string | undefined | null): string | null {
  if (!base) return null;
  const trimmed = base.trim().replace(/\/+$/, "");
  return trimmed.length ? trimmed : null;
}

export function getApiBase(): string | null {
  return normalize(API_BASE);
}

export function assertApiBase(): string {
  const base = getApiBase();
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_BASE is not configured; unable to reach backend API");
  }
  return base;
}
