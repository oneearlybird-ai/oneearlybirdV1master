"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import MobileBottomNav from "@/components/mobile/BottomNav";
import Toasts from "@/components/Toasts";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";
import { apiFetch } from "@/lib/http";
import { getLandingPath } from "@/lib/authPaths";
import BrandMark from "@/components/stellar/BrandMark";

const LOGOUT_EVENT_KEY = "__ob_logout";

export default function MobileLayout({ children }: { children: ReactNode }) {
  const { open } = useAuthModal();
  const { status, markUnauthenticated } = useAuthSession();
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === LOGOUT_EVENT_KEY) {
        markUnauthenticated();
        window.location.href = getLandingPath();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [markUnauthenticated]);

  const handleSignIn = useCallback(() => {
    open("signin");
  }, [open]);

  const handleSignOut = useCallback(async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
        cache: "no-store",
      });
    } catch (error) {
      console.error("mobile_signout_failed", { message: (error as Error)?.message });
    } finally {
      try {
        localStorage.setItem(LOGOUT_EVENT_KEY, String(Date.now()));
      } catch (error) {
        console.warn("mobile_signout_storage_failed", { message: (error as Error)?.message });
      }
      window.dispatchEvent(new CustomEvent("ob:auth:logout"));
      markUnauthenticated();
      window.location.href = getLandingPath();
      setSigningOut(false);
    }
  }, [markUnauthenticated, signingOut]);

  const isAuthenticated = status === "authenticated";

  const headerAction = useMemo(() => {
    if (status === "loading") {
      return (
        <span className="inline-flex h-11 items-center justify-center rounded-xl border border-white/15 px-4 text-sm text-white/60">
          Checking…
        </span>
      );
    }
    if (isAuthenticated) {
      return (
        <button
          type="button"
          onClick={() => void handleSignOut()}
          disabled={signingOut}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-white/20 px-4 text-sm font-medium text-white/85 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-50"
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={handleSignIn}
        className="inline-flex h-11 items-center justify-center rounded-xl border border-white/20 px-4 text-sm font-medium text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        Sign in
      </button>
    );
  }, [handleSignIn, handleSignOut, isAuthenticated, signingOut, status]);

  useEffect(() => {
    if (status === "loading") return;
    if (isAuthenticated) return;
    const currentPath = window.location.pathname;
    if (currentPath.startsWith("/m/dashboard")) {
      window.location.href = getLandingPath();
    }
  }, [isAuthenticated, status]);

  return (
    <div className="relative flex min-h-[100svh] flex-col bg-neutral-950 text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.4),_transparent_60%)] opacity-80" />
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#05050b]/95 backdrop-blur supports-[backdrop-filter]:bg-[#05050b]/85">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <BrandMark href="/m" />
          {headerAction}
        </div>
      </header>
      <main className="flex-1 pb-[calc(env(safe-area-inset-bottom)+4.25rem)] pt-2">{children}</main>
      <MobileBottomNav status={status} isAuthenticated={isAuthenticated} onSignIn={handleSignIn} />
      <Toasts />
    </div>
  );
}
