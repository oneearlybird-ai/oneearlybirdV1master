"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { dashboardFetch } from "@/lib/dashboardFetch";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

export type TenantProfile = {
  tenantId?: string;
  planKey?: string | null;
  planPriceId?: string | null;
  [key: string]: unknown;
};

type RefreshOptions = {
  showLoading?: boolean;
};

type AuthSessionValue = {
  status: SessionStatus;
  profile: TenantProfile | null;
  refresh: (options?: RefreshOptions) => Promise<void>;
  markUnauthenticated: () => void;
};

const AuthSessionContext = createContext<AuthSessionValue | null>(null);

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [profile, setProfile] = useState<TenantProfile | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await dashboardFetch("/tenants/profile", { cache: "no-store" });
      if (response.ok) {
        const data = (await response.json()) as TenantProfile;
        setProfile(data);
        setStatus("authenticated");
        return;
      }
      if (response.status === 401) {
        setProfile(null);
        setStatus("unauthenticated");
        return;
      }
      setProfile(null);
      setStatus("unauthenticated");
    } catch {
      setProfile(null);
      setStatus("unauthenticated");
    }
  }, []);

  const refresh = useCallback(
    async ({ showLoading = false }: RefreshOptions = {}) => {
      if (showLoading) {
        setStatus("loading");
      }
      await fetchProfile();
    },
    [fetchProfile],
  );

  const markUnauthenticated = useCallback(() => {
    setProfile(null);
    setStatus("unauthenticated");
  }, []);

  useEffect(() => {
    void refresh({ showLoading: true });
  }, [refresh]);

  useEffect(() => {
    const handleAuthSuccess = () => {
      void refresh({ showLoading: true });
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
        void refresh({ showLoading: true });
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

export function useAuthSession(): AuthSessionValue {
  const ctx = useContext(AuthSessionContext);
  if (!ctx) {
    throw new Error("useAuthSession must be used within an AuthSessionProvider");
  }
  return ctx;
}
