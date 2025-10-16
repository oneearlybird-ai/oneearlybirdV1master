"use client";

import { useCallback, useState } from "react";
import { redirectTo } from "@/lib/clientNavigation";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";
import { apiFetch } from "@/lib/http";
import { getDashboardPath, getLandingPath } from "@/lib/authPaths";

const LOGOUT_EVENT_KEY = "__ob_logout";

export default function AuthControls() {
  const { status, markUnauthenticated } = useAuthSession();
  const { open } = useAuthModal();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = useCallback(async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
        cache: "no-store",
      });
    } catch (error) {
      console.error("signout_request_failed", { message: (error as Error)?.message });
    } finally {
      try {
        localStorage.setItem(LOGOUT_EVENT_KEY, String(Date.now()));
      } catch (storageError) {
        console.warn("signout_storage_failed", { message: (storageError as Error)?.message });
      }
      window.dispatchEvent(new CustomEvent("ob:auth:logout"));
      markUnauthenticated();
      redirectTo(getLandingPath());
      setSigningOut(false);
    }
  }, [markUnauthenticated, signingOut]);

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
        <button
          onClick={() => redirectTo(getDashboardPath())}
          className="rounded-xl border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:text-white"
          type="button"
        >
          Dashboard
        </button>
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
      <button
        type="button"
        onClick={() => open("signin")}
        className="rounded-xl border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:text-white"
      >
        Sign in
      </button>
      <button
        type="button"
        onClick={() => open("signup")}
        className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
      >
        Get Started
      </button>
    </div>
  );
}
