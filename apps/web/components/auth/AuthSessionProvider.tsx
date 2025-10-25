"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { dashboardFetch } from "@/lib/dashboardFetch";

const SESSION_COOKIE_REGEX = /(?:^|;\s*)(?:__Host-)?(?:__Secure-)?ob_session[\w-]*=/;

function hasAuthSessionCookie(): boolean {
  if (typeof document === "undefined") {
    return false;
  }
  const raw = document.cookie ?? "";
  if (!raw) {
    return false;
  }
  return SESSION_COOKIE_REGEX.test(raw);
}

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

export type TenantProfile = {
  tenantId?: string;
  planKey?: string | null;
  planPriceId?: string | null;
  accountNumber?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  email?: string | null;
  businessName?: string | null;
  businessPhone?: string | null;
  timezone?: string | null;
  addressNormalized?: {
    line1: string;
    line2?: string | null;
    city: string;
    region: string;
    postal: string;
    country: string;
    lat?: number | null;
    lng?: number | null;
  } | null;
  hours?: Array<{ day: string; open: string; close: string }> | null;
  industry?: string | null;
  crm?: "hubspot" | "salesforce" | "none" | "other" | string | null;
  locations?: number | null;
  website?: string | null;
  businessProfileComplete?: boolean | null;
  stepUpOkUntil?: string | null;
  needsAccountCreate?: boolean | null;
  [key: string]: unknown;
};

type RefreshOptions = {
  showLoading?: boolean;
  retryOnUnauthorized?: boolean;
};

type AuthSessionValue = {
  status: SessionStatus;
  profile: TenantProfile | null;
  refresh: (options?: RefreshOptions) => Promise<TenantProfile | null>;
  markUnauthenticated: () => void;
};

const AuthSessionContext = createContext<AuthSessionValue | null>(null);

type AuthSessionProviderProps = {
  children: ReactNode;
  initialStatus?: SessionStatus;
  initialProfile?: TenantProfile | null;
};

export function AuthSessionProvider({
  children,
  initialStatus = "loading",
  initialProfile = null,
}: AuthSessionProviderProps) {
  const [status, setStatus] = useState<SessionStatus>(initialStatus);
  const [profile, setProfile] = useState<TenantProfile | null>(initialProfile);
  const initialStatusRef = useRef(initialStatus);

  type FetchResult =
    | { kind: "ok"; profile: TenantProfile | null }
    | { kind: "unauthorized" }
    | { kind: "error" };

  const fetchProfile = useCallback(async (): Promise<FetchResult> => {
    if (!hasAuthSessionCookie()) {
      setProfile(null);
      setStatus("unauthenticated");
      return { kind: "unauthorized" };
    }
    try {
      const response = await dashboardFetch("/api/dashboard/profile", { cache: "no-store", suppressAuthRedirect: true });
      if (response.ok) {
        const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
        const authenticated = typeof data.authenticated === "boolean" ? data.authenticated : true;
        if (!authenticated) {
          setProfile(null);
          setStatus("unauthenticated");
          return { kind: "unauthorized" };
        }
        let profileData = ("profile" in data ? (data.profile as TenantProfile | null) : (data as TenantProfile | null)) ?? null;
        if (profileData && typeof data.needsAccountCreate === "boolean") {
          profileData = { ...profileData, needsAccountCreate: data.needsAccountCreate };
        }
        setProfile(profileData);
        setStatus("authenticated");
        return { kind: "ok", profile: profileData };
      }
      if (response.status === 401) {
        setProfile(null);
        setStatus("unauthenticated");
        return { kind: "unauthorized" };
      }
      setProfile(null);
      setStatus("unauthenticated");
      return { kind: "error" };
    } catch {
      setProfile(null);
      setStatus("unauthenticated");
      return { kind: "error" };
    }
  }, []);

  const refresh = useCallback(
    async ({ showLoading = false, retryOnUnauthorized = false }: RefreshOptions = {}) => {
      if (!hasAuthSessionCookie()) {
        setProfile(null);
        setStatus("unauthenticated");
        return null;
      }
      if (showLoading) {
        setStatus("loading");
      }
      const result = await fetchProfile();
      if (result.kind === "unauthorized" && retryOnUnauthorized) {
        await new Promise((resolve) => setTimeout(resolve, 350));
        const retryResult = await fetchProfile();
        return retryResult.kind === "ok" ? retryResult.profile : null;
      }
      return result.kind === "ok" ? result.profile : null;
    },
    [fetchProfile],
  );

  const markUnauthenticated = useCallback(() => {
    setProfile(null);
    setStatus("unauthenticated");
  }, []);

  useEffect(() => {
    initialStatusRef.current = initialStatus;
  }, [initialStatus]);

  useEffect(() => {
    if (initialStatusRef.current !== "loading") {
      return;
    }
    void refresh({ showLoading: true });
  }, [refresh]);

  useEffect(() => {
    const handleAuthSuccess = () => {
      void refresh({ showLoading: true, retryOnUnauthorized: true });
    };
    const handleAuthLogout = () => {
      markUnauthenticated();
    };
    window.addEventListener("ob:auth:success", handleAuthSuccess);
    window.addEventListener("ob:auth:logout", handleAuthLogout);
    return () => {
      window.removeEventListener("ob:auth:success", handleAuthSuccess);
      window.removeEventListener("ob:auth:logout", handleAuthLogout);
    };
  }, [markUnauthenticated, refresh]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "__ob_login") {
        void refresh({ showLoading: true, retryOnUnauthorized: true });
      }
      if (event.key === "__ob_logout") {
        markUnauthenticated();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [markUnauthenticated, refresh]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [refresh]);

  useEffect(() => {
    const handlePageShow = () => {
      void refresh();
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [refresh]);

  const value = useMemo<AuthSessionValue>(
    () => ({
      status,
      profile,
      refresh,
      markUnauthenticated,
    }),
    [markUnauthenticated, profile, refresh, status],
  );

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export default AuthSessionProvider;

export function useAuthSession(): AuthSessionValue {
  const ctx = useContext(AuthSessionContext);
  if (!ctx) {
    throw new Error("useAuthSession must be used within an AuthSessionProvider");
  }
  return ctx;
}
