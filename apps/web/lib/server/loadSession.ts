"use server";

import { cookies, headers } from "next/headers";
import type { TenantProfile } from "@/components/auth/AuthSessionProvider";

type ServerSession = {
  status: "authenticated" | "unauthenticated";
  profile: TenantProfile | null;
};

const PROFILE_PATH = "/api/dashboard/profile";

export async function loadServerSession(): Promise<ServerSession> {
  const cookieHeader = await serializeCookies();
  const incoming = await headers();
  const proto = incoming.get("x-forwarded-proto") ?? "https";
  const host = incoming.get("x-forwarded-host") ?? incoming.get("host") ?? undefined;
  const fallbackBase = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  const base = host ? `${proto}://${host}` : fallbackBase;
  const target = base ? `${base}${PROFILE_PATH}` : PROFILE_PATH;

  try {
    const response = await fetch(target, {
      method: "GET",
      headers: buildHeaders(cookieHeader),
      cache: "no-store",
      credentials: "include",
    });

    if (response.status === 401 || response.status === 403) {
      return { status: "unauthenticated", profile: null };
    }

    if (!response.ok) {
      return { status: "unauthenticated", profile: null };
    }

    const payload = (await response.json().catch(() => null)) as unknown;
    const profile = normaliseProfile(payload);
    if (!profile) {
      return { status: "authenticated", profile: null };
    }

    return { status: "authenticated", profile };
  } catch (error) {
    console.warn("server_session_load_failed", {
      message: (error as Error)?.message ?? "unknown_error",
    });
    return { status: "unauthenticated", profile: null };
  }
}

async function serializeCookies(): Promise<string> {
  const store = await cookies();
  return store
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");
}

function buildHeaders(cookieHeader: string): HeadersInit {
  const h = new Headers();
  h.set("accept", "application/json");
  if (cookieHeader) {
    h.set("cookie", cookieHeader);
  }
  return h;
}

function normaliseProfile(data: unknown): TenantProfile | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const record = data as Record<string, unknown>;
  const authenticatedFlag = record.authenticated;
  if (typeof authenticatedFlag === "boolean" && authenticatedFlag === false) {
    return null;
  }

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
