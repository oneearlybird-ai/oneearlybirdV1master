"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AuthModal from "@/components/auth/AuthModal";
import { resolvePopupMessage } from "@/lib/popup";
import { apiFetch } from "@/lib/http";

export type AuthModalMode = "signin" | "signup";

type AuthModalContextValue = {
  open: (mode?: AuthModalMode) => void;
  close: () => void;
  isOpen: boolean;
  mode: AuthModalMode;
  setMode: (mode: AuthModalMode) => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function useAuthModal(): AuthModalContextValue {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return ctx;
}

export default function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState<{ open: boolean; mode: AuthModalMode }>({ open: false, mode: "signin" });

  const warmDashboardData = useCallback(async () => {
    try {
      await Promise.all([
        apiFetch("/tenants/profile", { cache: "no-store" }),
        apiFetch("/billing/summary", { cache: "no-store" }),
        apiFetch("/usage/summary?window=week", { cache: "no-store" }),
      ]);
    } catch (error) {
      console.warn("auth_refresh_failed", {
        message: (error as Error)?.message,
      });
    }
  }, []);

  const refreshBillingState = useCallback(async () => {
    try {
      await Promise.all([
        apiFetch("/tenants/profile", { cache: "no-store" }),
        apiFetch("/billing/summary", { cache: "no-store" }),
      ]);
    } catch (error) {
      console.warn("billing_refresh_failed", {
        message: error instanceof Error ? error.message : "unknown_error",
      });
    }
  }, []);

  const applyQuery = useCallback(
    (mode: AuthModalMode | null) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      if (mode) params.set("auth", mode);
      else params.delete("auth");
      const query = params.toString();
      const nextUrl = `${pathname}${query ? `?${query}` : ""}`;
      router.replace(nextUrl, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const open = useCallback(
    (mode: AuthModalMode = "signin") => {
      setState({ open: true, mode });
      applyQuery(mode);
    },
    [applyQuery],
  );

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
    applyQuery(null);
  }, [applyQuery]);

  const setMode = useCallback((mode: AuthModalMode) => {
    setState((prev) => {
      if (prev.open) {
        applyQuery(mode);
      }
      return { ...prev, mode };
    });
  }, [applyQuery]);

  useEffect(() => {
    const authParam = searchParams?.get("auth");
    if (authParam === "signin" || authParam === "signup") {
      setState({ open: true, mode: authParam });
    }
  }, [searchParams]);

  useEffect(() => {
    if (state.open) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }
    return undefined;
  }, [state.open]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const allowedOrigin = "https://oneearlybird.ai";
    const dispatchAppEvent = (type: "auth:success" | "billing:checkout:success" | "billing:portal:returned") => {
      const eventName =
        type === "auth:success"
          ? "ob:auth:success"
          : type === "billing:checkout:success"
            ? "ob:billing:checkout:success"
            : "ob:billing:portal:returned";
      window.dispatchEvent(new CustomEvent(eventName));
    };
    const handlePostMessage = (event: MessageEvent) => {
      if (event.origin !== allowedOrigin) return;
      const data = event.data as { type?: string } | null;
      const type = data?.type;
      if (
        type === "auth:success" ||
        type === "billing:checkout:success" ||
        type === "billing:trial:success" ||
        type === "billing:portal:returned"
      ) {
        const normalized: "auth:success" | "billing:checkout:success" | "billing:portal:returned" =
          type === "billing:trial:success" ? "billing:checkout:success" : type;
        resolvePopupMessage(normalized);
        if (normalized === "auth:success") {
          void warmDashboardData();
          close();
        } else if (normalized === "billing:checkout:success") {
          void refreshBillingState();
        }
        dispatchAppEvent(normalized);
      }
    };
    const handleFallback = (event: Event) => {
      const detail = (event as CustomEvent<{ type?: string }>).detail;
      const type = detail?.type;
      if (
        type === "auth:success" ||
        type === "billing:checkout:success" ||
        type === "billing:trial:success" ||
        type === "billing:portal:returned"
      ) {
        const normalized: "auth:success" | "billing:checkout:success" | "billing:portal:returned" =
          type === "billing:trial:success" ? "billing:checkout:success" : type;
        resolvePopupMessage(normalized);
        if (normalized === "auth:success") {
          void warmDashboardData();
          close();
        } else if (normalized === "billing:checkout:success") {
          void refreshBillingState();
        }
        dispatchAppEvent(normalized);
      }
    };
    window.addEventListener("message", handlePostMessage);
    window.addEventListener("popup:fallback", handleFallback as EventListener);
    return () => {
      window.removeEventListener("message", handlePostMessage);
      window.removeEventListener("popup:fallback", handleFallback as EventListener);
    };
  }, [close, refreshBillingState, warmDashboardData]);

  const value = useMemo<AuthModalContextValue>(
    () => ({ open, close, isOpen: state.open, mode: state.mode, setMode }),
    [open, close, setMode, state.open, state.mode],
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      {state.open ? <AuthModal /> : null}
    </AuthModalContext.Provider>
  );
}
