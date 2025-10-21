"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";
import { apiFetch } from "@/lib/http";
import { getDashboardPath, getLandingPath, getProfileCapturePath } from "@/lib/authPaths";
import { redirectTo } from "@/lib/clientNavigation";

const LOGOUT_EVENT_KEY = "__ob_logout";

export function AccountDropdown() {
  const { status, profile, markUnauthenticated } = useAuthSession();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const displayName = useMemo(() => {
    const names = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ").trim();
    if (names) return names;
    const email = profile?.email ?? profile?.contactEmail ?? "";
    if (email.includes("@")) {
      return email.split("@")[0] ?? "Account";
    }
    return "Account";
  }, [profile?.contactEmail, profile?.email, profile?.firstName, profile?.lastName]);

  const initials = useMemo(() => {
    const parts = displayName.split(" ").filter(Boolean);
    if (!parts.length) return "EB";
    if (parts.length === 1) return parts[0]?.slice(0, 2).toUpperCase() ?? "EB";
    return `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`.toUpperCase();
  }, [displayName]);

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
      setOpen(false);
    }
  }, [markUnauthenticated, signingOut]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (status !== "authenticated") {
    return null;
  }

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-semibold text-black">
          {initials}
        </span>
        <span className="hidden sm:inline-flex max-w-[8rem] truncate">{displayName}</span>
        <svg viewBox="0 0 24 24" className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-auto min-w-[12rem] sm:max-w-[calc(100vw-2.5rem)] overflow-visible rounded-3xl border border-white/12 bg-[#05050b]/97 py-3 text-sm shadow-[0_28px_70px_rgba(5,5,11,0.45)] backdrop-blur sm:min-w-[14rem] md:w-64 md:max-w-none before:absolute before:right-6 before:-top-2 before:h-3.5 before:w-3.5 before:rotate-45 before:rounded-sm before:border before:border-white/12 before:bg-[#05050b]/97 before:content-['']"
        >
          <div className="px-4 pb-2 text-xs uppercase tracking-wide text-white/50">Account</div>
          <div className="space-y-0.5">
            <Link
              role="menuitem"
              href={getDashboardPath()}
              className="flex items-center gap-2 rounded-2xl px-3 py-2 text-white/80 transition hover:bg-white/10 hover:text-white"
              onClick={() => setOpen(false)}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M3 12l7-7 7 7M5 10v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Dashboard
            </Link>
            <Link
              role="menuitem"
              href={getProfileCapturePath()}
              className="flex items-center gap-2 rounded-2xl px-3 py-2 text-white/80 transition hover:bg-white/10 hover:text-white"
              onClick={() => setOpen(false)}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M12 14c3.866 0 7-1.79 7-4s-3.134-4-7-4-7 1.79-7 4 3.134 4 7 4Z" />
                <path d="M5 10v4c0 2.21 3.134 4 7 4s7-1.79 7-4v-4" />
              </svg>
              Profile details
            </Link>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              void handleSignOut();
            }}
            disabled={signingOut}
            className="mt-2 flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-100 disabled:opacity-60"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M15 12H3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M11 8L15 12L11 16" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19 4H12C10.3431 4 9 5.34315 9 7V9" strokeLinecap="round" />
              <path d="M9 15V17C9 18.6569 10.3431 20 12 20H19" strokeLinecap="round" />
            </svg>
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
