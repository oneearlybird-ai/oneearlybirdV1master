"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "@/lib/config";
import { redirectTo } from "@/lib/clientNavigation";

const LOGOUT_EVENT_KEY = "__ob_logout";
const LOGIN_EVENT_KEY = "__ob_login";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export default function AuthControls() {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [signingOut, setSigningOut] = useState(false);

  const apiUrl = useCallback((path: string) => {
    const base = (API_BASE || "").replace(/\/+$/, "");
    return base ? `${base}${path}` : `/api/upstream${path}`;
  }, []);

  const refreshSessionState = useCallback(async () => {
    try {
      const response = await fetch(apiUrl("/tenants/me"), {
        method: "GET",
        credentials: "include",
        headers: { "cache-control": "no-store" }
      });
      if (response.ok) {
        setStatus("authenticated");
      } else if (response.status === 401) {
        setStatus("unauthenticated");
      } else {
        setStatus("unauthenticated");
      }
    } catch {
      setStatus("unauthenticated");
    }
  }, [apiUrl]);

  useEffect(() => {
    refreshSessionState();
  }, [refreshSessionState]);

  useEffect(() => {
    const handlePageShow = () => {
      refreshSessionState();
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [refreshSessionState]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === LOGOUT_EVENT_KEY) {
        setStatus("unauthenticated");
        redirectTo("/");
      }
      if (event.key === LOGIN_EVENT_KEY) {
        refreshSessionState();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [refreshSessionState]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshSessionState();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [refreshSessionState]);

  const handleSignOut = useCallback(async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await fetch(apiUrl("/auth/logout"), {
        method: "POST",
        credentials: "include",
        headers: { "cache-control": "no-store" }
      });
    } catch (error) {
      console.error("signout_request_failed", { message: (error as Error)?.message });
    }

    try {
      localStorage.setItem(LOGOUT_EVENT_KEY, String(Date.now()));
    } catch (error) {
      console.warn("signout_storage_failed", { message: (error as Error)?.message });
    }

    setStatus("unauthenticated");
    redirectTo("/");
  }, [apiUrl, signingOut]);

  if (status === "loading") {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-white/60">Checking session…</span>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="rounded-xl border border-white/20 px-4 py-2 text-sm text-white/80 hover:text-white"
        >
          Dashboard
        </Link>
        <button
          onClick={() => {
            void handleSignOut();
          }}
          disabled={signingOut}
          className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-60"
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="rounded-xl border border-white/20 px-4 py-2 text-sm text-white/80 hover:text-white"
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90"
      >
        Get Started
      </Link>
    </div>
  );
}
