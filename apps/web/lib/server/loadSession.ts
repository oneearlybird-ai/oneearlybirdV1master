import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import type { TenantProfile, SessionStatus } from "@/components/auth/AuthSessionProvider";
import { serverApiFetch } from "@/lib/server-api";

type ServerSession = {
  status: SessionStatus;
  profile: TenantProfile | null;
};

function normaliseProfile(data: unknown): TenantProfile | null {
  if (!data || typeof data !== "object") {
    return null;
  }
  const record = data as Record<string, unknown>;
  const baseProfile =
    record.profile && typeof record.profile === "object"
      ? (record.profile as TenantProfile)
      : (record as TenantProfile);
  if (!baseProfile || typeof baseProfile !== "object") {
    return null;
  }

  if (typeof record.needsAccountCreate === "boolean") {
    return { ...baseProfile, needsAccountCreate: record.needsAccountCreate };
  }

  return baseProfile;
}

export const loadServerSession = cache(async (): Promise<ServerSession> => {
  try {
    const response = await serverApiFetch("/api/dashboard/profile", { method: "GET" });
    if (response.status === 401 || response.status === 403) {
      return { status: "unauthenticated", profile: null };
    }
    if (!response.ok) {
      return { status: "unauthenticated", profile: null };
    }

    const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    const authenticated = typeof payload?.authenticated === "boolean" ? payload.authenticated : true;
    if (!authenticated) {
      return { status: "unauthenticated", profile: null };
    }

    const profile = normaliseProfile(payload);
    if (!profile) {
      return { status: "authenticated", profile: null };
    }

    return { status: "authenticated", profile };
  } catch (error) {
    const requestHeaders = await headers();
    console.warn("server_session_load_failed", {
      message: (error as Error)?.message ?? "unknown_error",
      path: requestHeaders.get("x-pathname") ?? undefined,
    });
    return { status: "unauthenticated", profile: null };
  }
});
