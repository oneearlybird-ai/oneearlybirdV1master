"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";
import { apiFetch } from "@/lib/http";
import { redirectTo } from "@/lib/clientNavigation";
import { getDashboardPath, getLandingPath } from "@/lib/authPaths";

type Variant = "desktop" | "mobile";

type Props = {
  variant?: Variant;
  onNavigate?: () => void;
};

const LOGOUT_EVENT_KEY = "__ob_logout";

function baseClasses(variant: Variant) {
  if (variant === "mobile") {
    return "flex flex-col gap-3 w-full";
  }
  return "flex items-center gap-3";
}

export default function StellarAuthControls({ variant = "desktop", onNavigate }: Props) {
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
      <div className={baseClasses(variant)}>
        <span className={variant === "desktop" ? "text-sm text-white/70" : "w-full rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 text-center"}>
          Checking session…
        </span>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className={baseClasses(variant)}>
        <Link
          href={getDashboardPath()}
          onClick={onNavigate}
          className={
            variant === "desktop"
              ? "inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-2 text-sm font-medium text-white/85 hover:text-white hover:border-white/30 transition"
              : "w-full inline-flex items-center justify-center rounded-xl border border-white/15 px-4 py-3 text-sm font-medium text-white/85 hover:text-white transition"
          }
        >
          Dashboard
        </Link>
        <button
          type="button"
          onClick={() => {
            void handleSignOut();
            onNavigate?.();
          }}
          disabled={signingOut}
          className={
            variant === "desktop"
              ? "inline-flex items-center justify-center rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-60"
              : "w-full inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-60"
          }
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    );
  }

  return (
    <div className={baseClasses(variant)}>
      <button
        type="button"
        onClick={() => {
          open("signin");
          onNavigate?.();
        }}
        className={
          variant === "desktop"
            ? "inline-flex items-center justify-center rounded-xl border border-white/20 px-5 py-2 text-sm font-medium text-white/80 transition hover:text-white hover:border-white/40"
            : "w-full inline-flex items-center justify-center rounded-xl border border-white/20 px-4 py-3 text-sm font-medium text-white/80 transition hover:text-white hover:border-white/40"
        }
      >
        Sign in
      </button>
      <Link
        href="/signup"
        onClick={onNavigate}
        className={
          variant === "desktop"
            ? "inline-flex items-center justify-center rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
            : "w-full inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
        }
      >
        Start free
      </Link>
    </div>
  );
}
