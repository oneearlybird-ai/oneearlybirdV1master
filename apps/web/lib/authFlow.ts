"use client";

type StoredAuthFlow = {
  flow: AuthFlowKind;
  createdAt: number;
  metadata?: Record<string, string>;
};

const STORAGE_KEY = "__ob_active_auth_flow";

export type AuthFlowKind =
  | "google-signin"
  | "google-signup"
  | "email-signin"
  | "email-signup";

export function setActiveAuthFlow(flow: AuthFlowKind, metadata: Record<string, string> = {}): void {
  if (typeof window === "undefined") return;
  try {
    const payload: StoredAuthFlow = {
      flow,
      createdAt: Date.now(),
      metadata,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn("auth_flow_set_failed", { message: (error as Error)?.message });
  }
}

export function peekActiveAuthFlow(): StoredAuthFlow | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuthFlow;
  } catch (error) {
    console.warn("auth_flow_peek_failed", { message: (error as Error)?.message });
    return null;
  }
}

export function consumeActiveAuthFlow(): StoredAuthFlow | null {
  const flow = peekActiveAuthFlow();
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("auth_flow_consume_failed", { message: (error as Error)?.message });
    }
  }
  return flow;
}

export function clearActiveAuthFlow(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("auth_flow_clear_failed", { message: (error as Error)?.message });
  }
}
