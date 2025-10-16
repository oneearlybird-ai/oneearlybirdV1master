"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import MobileBottomNav from "@/components/mobile/BottomNav";
import Toasts from "@/components/Toasts";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";
import { apiFetch } from "@/lib/http";
import { getLandingPath } from "@/lib/authPaths";

const LOGOUT_EVENT_KEY = "__ob_logout";

export default function MobileLayout({ children }: { children: ReactNode }) {
  const { open } = useAuthModal();
  const { status, markUnauthenticated } = useAuthSession();
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const header = document.getElementById("eb-header");
    const footer = document.querySelector("footer");
    const storedStyles: Array<{ el: HTMLElement; display: string }> = [];
    if (header) {
      storedStyles.push({ el: header, display: header.style.display });
      header.style.display = "none";
    }
    if (footer instanceof HTMLElement) {
      storedStyles.push({ el: footer, display: footer.style.display });
      footer.style.display = "none";
    }
    document.body.classList.add("ob-mobile-shell");
    return () => {
      storedStyles.forEach(({ el, display }) => {
        el.style.display = display;
      });
      document.body.classList.remove("ob-mobile-shell");
    };
  }, []);

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
        <span className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 px-4 text-sm text-white/60">
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
          className="inline-flex h-11 items-center justify-center rounded-full border border-white/20 px-4 text-sm font-medium text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:opacity-50"
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={handleSignIn}
        className="inline-flex h-11 items-center justify-center rounded-full border border-white/20 px-4 text-sm font-medium text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
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
      <header className="sticky top-0 z-40 border-b border-white/10 bg-neutral-950/90 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/70">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="/m" className="text-lg font-semibold tracking-tight text-white" aria-label="EarlyBird AI mobile home">
            EarlyBird AI
          </a>
          {headerAction}
        </div>
      </header>
      <main className="flex-1 pb-[calc(env(safe-area-inset-bottom)+4.75rem)] pt-2">{children}</main>
      <MobileBottomNav status={status} isAuthenticated={isAuthenticated} onSignIn={handleSignIn} />
      <Toasts />
    </div>
  );
}
