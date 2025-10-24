"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Toasts from "@/components/Toasts";
import { dashboardFetch } from "@/lib/dashboardFetch";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";
import { toast } from "@/components/Toasts";
import { fallbackNameFromEmail, maskAccountNumber } from "@/lib/format";

function LayoutSkeleton() {
  return (
    <div className="min-h-dvh bg-stellar-surface text-white">
      <div className="flex items-center justify-center px-6 py-24">
        <div className="rounded-2xl border border-white/10 bg-white/10 px-6 py-4 text-sm text-white/70 shadow-glow-md">
          Loading dashboard…
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status, profile } = useAuthSession();
  const [live, setLive] = useState(true);
  const [unread, setUnread] = useState(0);
  const [build, setBuild] = useState<string|undefined>(undefined);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const guardNotifiedRef = useRef(false);
  useEffect(() => {
    let cancelled = false;
    dashboardFetch('/usage/summary', { cache: 'no-store' })
      .then(async r => r.ok ? (await r.json()) : null)
      .then((j) => { if (!cancelled && j?.version) setBuild(String(j.version).slice(0,7)); })
      .catch(() => { return; });
    // Demo unread updates badge (persist dismiss per session)
    try {
      const k = 'eb_unread_demo';
      const v = sessionStorage.getItem(k);
      const n = v ? Number(v) : 3;
      if (!Number.isFinite(n) || n < 0) setUnread(0); else setUnread(n);
    } catch (e) { void e; }
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName || '';
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable;
      if (!isTyping && e.key === '/') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => { cancelled = true };
  }, []);
  useEffect(() => {
    if (status === "authenticated") {
      guardNotifiedRef.current = false;
    }
    if (status === "unauthenticated" && !guardNotifiedRef.current) {
      guardNotifiedRef.current = true;
      toast("Please sign in to continue", "error");
      router.replace("/");
    }
  }, [router, status]);
  if (status === "loading") {
    return <LayoutSkeleton />;
  }
  if (status === "unauthenticated") {
    return null;
  }
  const primaryEmail = profile?.contactEmail ?? profile?.email ?? "";
  const greetingName = useMemo(() => {
    const fromProfile = (profile?.firstName ?? "").toString().trim();
    if (fromProfile.length > 0) return fromProfile;
    const display = (profile?.displayName ?? "").toString().trim();
    if (display.length > 0) return display;
    return fallbackNameFromEmail(primaryEmail);
  }, [primaryEmail, profile?.displayName, profile?.firstName]);
  const accountNumberMask = useMemo(() => maskAccountNumber(profile?.accountNumber ?? null), [profile?.accountNumber]);

  const handleCopyAccount = async () => {
    if (!profile?.accountNumber) return;
    try {
      if (!navigator?.clipboard?.writeText) {
        throw new Error("clipboard_unavailable");
      }
      await navigator.clipboard.writeText(profile.accountNumber);
      toast("Account number copied", "success");
    } catch (err) {
      console.error("account_copy_failed", err);
      toast("Couldn’t copy account number", "error");
    }
  };
  const pathname = usePathname() || "";
  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        className={`block rounded-xl px-3.5 py-2 text-sm font-medium transition ${
          isActive ? "bg-white/10 text-white shadow-glow-md" : "text-white/70 hover:bg-white/10 hover:text-white"
        }`}
        aria-current={isActive ? "page" : undefined}
      >
        {label}
      </Link>
    );
  };
  return (
    <div className="min-h-dvh bg-stellar-surface text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-0 md:grid-cols-[240px,1fr]">
        <aside className="hidden border-r border-white/10 bg-white/5 md:block">
          <div className="space-y-4 px-5 py-6">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/50">EarlyBird</div>
            <nav className="space-y-1.5">
              <NavLink href="/dashboard" label="Dashboard" />
              <NavLink href="/dashboard/calls" label="Calls & Recordings" />
              <NavLink href="/dashboard/appointments" label="Appointments" />
              <NavLink href="/dashboard/integrations" label="Integrations" />
              <NavLink href="/dashboard/phone" label="Phone & Agent" />
              <NavLink href="/dashboard/billing" label="Billing & Plan" />
              <NavLink href="/dashboard/settings" label="Settings" />
            </nav>
          </div>
        </aside>
        <div className="relative">
          <div className="sticky top-0 z-30 border-b border-white/10 bg-stellar-surface/80 backdrop-blur-xl supports-[backdrop-filter]:bg-stellar-surface/65">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-xs font-medium text-white/70">
                  <span className={`inline-flex h-2 w-2 rounded-full ${live ? "bg-emerald-400" : "bg-red-400"}`} />
                  <span>{live ? "AI Receptionist: Live" : "AI Receptionist: Paused"}</span>
                </div>
                <div className="text-xs text-white/60">
                  Welcome back, <span className="font-semibold text-white">{greetingName}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                {accountNumberMask ? (
                  <button
                    type="button"
                    onClick={handleCopyAccount}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5 py-2 text-xs font-medium text-white/70 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                    aria-label="Copy account number"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>{accountNumberMask}</span>
                  </button>
                ) : null}
                <button
                  onClick={() => alert("Test call triggered (preview).")}
                  className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black shadow-glow-md transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
                >
                  Test Call
                </button>
                <button
                  onClick={() => setLive((v) => !v)}
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
                >
                  {live ? "Pause" : "Go Live"}
                </button>
                <button
                  onClick={() => {
                    setUnread(0);
                    try {
                      sessionStorage.setItem("eb_unread_demo", "0");
                    } catch (e) {
                      void e;
                    }
                  }}
                  className="relative inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
                  aria-label="Updates"
                >
                  Updates
                  {unread > 0 ? (
                    <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-stellar-amber px-1 text-[10px] font-semibold text-black">
                      {unread}
                    </span>
                  ) : null}
                </button>
                <span className="hidden text-xs text-white/45 md:inline">
                  dashboard{build ? ` @ ${build}` : ""}
                </span>
                <input
                  ref={searchRef}
                  type="search"
                  placeholder="Search (press /)"
                  aria-label="Search"
                  className="w-44 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/40 transition focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-stellar-accent/40 md:w-52"
                />
              </div>
            </div>
          </div>
          <div className="px-5 py-6">{children}</div>
        </div>
      </div>
      <Toasts />
    </div>
  );
}
