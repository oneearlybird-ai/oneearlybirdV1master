"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type MobileNavProps = {
  isAuthenticated: boolean;
  onSignOut?: () => void;
  signingOut?: boolean;
  disabled?: boolean;
};

type NavItem = {
  label: string;
  href: string;
  match?: (pathname: string, hash: string) => boolean;
};

const marketingLinks: NavItem[] = [
  { label: "Home", href: "/m", match: (pathname) => pathname === "/m" },
  { label: "How it works", href: "/m#how-it-works", match: (pathname, hash) => pathname === "/m" && hash === "#how-it-works" },
  { label: "Preview demo", href: "/preview" },
  { label: "Pricing", href: "/m/pricing", match: (pathname) => pathname === "/m/pricing" },
  { label: "Docs", href: "/docs" },
  { label: "Support", href: "/support" },
];

const dashboardLinks: NavItem[] = [
  { label: "Overview", href: "/m/dashboard", match: (pathname) => pathname === "/m/dashboard" },
  { label: "Calls", href: "/m/dashboard/calls", match: (pathname) => pathname.startsWith("/m/dashboard/calls") },
  { label: "Appointments", href: "/m/dashboard/appointments", match: (pathname) => pathname.startsWith("/m/dashboard/appointments") },
  { label: "Phone & Agent", href: "/m/dashboard/phone", match: (pathname) => pathname.startsWith("/m/dashboard/phone") },
  { label: "Billing", href: "/m/dashboard/billing", match: (pathname) => pathname.startsWith("/m/dashboard/billing") },
  { label: "Settings", href: "/m/dashboard/settings", match: (pathname) => pathname.startsWith("/m/dashboard/settings") },
];

export default function MobileNav({ isAuthenticated, onSignOut, signingOut, disabled = false }: MobileNavProps) {
  const pathname = usePathname() || "/";
  const { open: openAuthModal } = useAuthModal();
  const [open, setOpen] = useState(false);
  const [hash, setHash] = useState<string>("");
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setHash(typeof window !== "undefined" ? window.location.hash : "");
    const handler = () => setHash(window.location.hash);
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const closeMenu = useCallback(() => {
    setOpen(false);
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
      }
    },
    [closeMenu],
  );

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    document.addEventListener("keydown", handleKeyDown);
    const { body } = document;
    const prevOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      body.style.overflow = prevOverflow;
      previousFocusRef.current?.focus?.();
    };
  }, [handleKeyDown, open]);

  const activeLinks = useMemo(() => {
    const currentHash = hash || (typeof window !== "undefined" ? window.location.hash : "");
    const links = isAuthenticated ? dashboardLinks : marketingLinks;
    return links.map((link) => {
      const match = link.match ? link.match(pathname, currentHash) : pathname === link.href;
      return { ...link, active: !!match };
    });
  }, [hash, isAuthenticated, pathname]);

  return (
    <>
      <button
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
        className="inline-flex h-11 items-center justify-center rounded-xl border border-white/15 px-4 text-sm font-medium text-white/85 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-50"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        Menu
      </button>

      {open && !disabled ? (
        <div
          className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-menu-title"
        >
          <div className="h-full w-full max-w-sm border-l border-white/10 bg-[#0b0b13] shadow-[0_25px_60px_rgba(14,28,75,0.45)]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="text-sm uppercase tracking-wide text-white/50">Navigate</div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeMenu}
                className="inline-flex items-center justify-center rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                Close
              </button>
            </div>

            <nav className="flex flex-col gap-1 px-3 py-4">
              {activeLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  aria-current={item.active ? "page" : undefined}
                  className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                    item.active ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto border-t border-white/10 px-5 py-4">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    void onSignOut?.();
                  }}
                  disabled={signingOut}
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/15 text-sm font-semibold text-white/85 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-60"
                >
                  {signingOut ? "Signing out…" : "Sign out"}
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      openAuthModal("signin");
                    }}
                    className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/15 text-sm font-medium text-white/85 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      openAuthModal("signup");
                    }}
                    className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-white text-sm font-semibold text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25"
                  >
                    Start free trial
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

