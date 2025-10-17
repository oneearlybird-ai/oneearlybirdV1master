"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { SessionStatus } from "@/components/auth/AuthSessionProvider";

type NavItem = {
  key: string;
  label: string;
  icon: (active: boolean) => ReactNode;
  href?: string;
  onClick?: () => void;
  match?: (pathname: string, hash: string) => boolean;
};

function iconClass(active: boolean) {
  return active ? "text-white" : "text-white/70";
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`h-6 w-6 ${iconClass(active)}`} fill="none">
      <path d="M3 10.75 12 3l9 7.75" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
      <path d="M5.5 9.5V21h13V9.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
      <path d="M9.5 21v-6h5v6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    </svg>
  );
}

function CallsIcon({ active }: { active: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`h-6 w-6 ${iconClass(active)}`} fill="none">
      <path
        d="M5 4a2 2 0 0 1 2-2h1.8a2 2 0 0 1 1.941 1.515l.612 2.45a2 2 0 0 1-1.044 2.27l-.818.41a11.5 11.5 0 0 0 5.384 5.384l.41-.818a2 2 0 0 1 2.27-1.044l2.45.612A2 2 0 0 1 21 16.2V18a2 2 0 0 1-2 2A15 15 0 0 1 4 5a2 2 0 0 1 1-1.732Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  );
}

function CalendarIcon({ active }: { active: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`h-6 w-6 ${iconClass(active)}`} fill="none">
      <rect x={3} y={4} width={18} height={17} rx={2} stroke="currentColor" strokeWidth={1.5} />
      <path d="M16 2v4M8 2v4M3 11h18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
      <circle cx={12} cy={16} r={1.2} fill="currentColor" />
      <circle cx={16} cy={16} r={1.2} fill="currentColor" />
      <circle cx={8} cy={16} r={1.2} fill="currentColor" />
    </svg>
  );
}

function PhoneIcon({ active }: { active: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`h-6 w-6 ${iconClass(active)}`} fill="none">
      <path
        d="M7 2h10a2 2 0 0 1 2 2v16l-4-3-3 3-3-3-4 3V4a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path d="M9 7h6M9 11h6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    </svg>
  );
}

function BillingIcon({ active }: { active: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`h-6 w-6 ${iconClass(active)}`} fill="none">
      <rect x={3} y={4} width={18} height={16} rx={2} stroke="currentColor" strokeWidth={1.5} />
      <path d="M3 9h18" stroke="currentColor" strokeWidth={1.5} />
      <path d="M9 15h2m3 0h2" stroke="currentColor" strokeLinecap="round" strokeWidth={1.5} />
    </svg>
  );
}

function InfoIcon({ active }: { active: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`h-6 w-6 ${iconClass(active)}`} fill="none">
      <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.5} />
      <path d="M12 8h.01M11 11h2v5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`h-6 w-6 ${iconClass(active)}`} fill="none">
      <path
        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 3c-4.418 0-8 2.239-8 5v.5h16V20c0-2.761-3.582-5-8-5Z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type MobileBottomNavProps = {
  status: SessionStatus;
  isAuthenticated: boolean;
  onSignIn: () => void;
};

export default function MobileBottomNav({ status, isAuthenticated, onSignIn }: MobileBottomNavProps) {
  const pathname = usePathname() || "/";
  const [hash, setHash] = useState("");

  useEffect(() => {
    setHash(window.location.hash);
    const handler = () => setHash(window.location.hash);
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const showSkeleton = status === "loading";

  const navItems = useMemo<NavItem[]>(() => {
    if (showSkeleton) {
      return [];
    }
    if (isAuthenticated) {
      return [
        {
          key: "home",
          label: "Dashboard",
          href: "/m/dashboard",
          icon: (active) => <HomeIcon active={active} />,
          match: (path) => path === "/m" || path === "/m/dashboard",
        },
        {
          key: "calls",
          label: "Calls",
          href: "/m/dashboard/calls",
          icon: (active) => <CallsIcon active={active} />,
          match: (path) => path.startsWith("/m/dashboard/calls"),
        },
        {
          key: "appts",
          label: "Appts",
          href: "/m/dashboard/appointments",
          icon: (active) => <CalendarIcon active={active} />,
          match: (path) => path.startsWith("/m/dashboard/appointments"),
        },
        {
          key: "phone",
          label: "Phone",
          href: "/m/dashboard/phone",
          icon: (active) => <PhoneIcon active={active} />,
          match: (path) => path.startsWith("/m/dashboard/phone"),
        },
        {
          key: "billing",
          label: "Billing",
          href: "/m/dashboard/billing",
          icon: (active) => <BillingIcon active={active} />,
          match: (path) => path.startsWith("/m/dashboard/billing"),
        },
      ];
    }

    return [
      {
        key: "home",
        label: "Home",
        href: "/m",
        icon: (active) => <HomeIcon active={active} />,
        match: (path) => path === "/m",
      },
      {
        key: "how",
        label: "How it works",
        href: "/m#how-it-works",
        icon: (active) => <InfoIcon active={active} />,
        match: (path, currentHash) => path === "/m" && currentHash === "#how-it-works",
      },
      {
        key: "pricing",
        label: "Pricing",
        href: "/m/pricing",
        icon: (active) => <BillingIcon active={active} />,
        match: (path) => path === "/m/pricing",
      },
      {
        key: "signin",
        label: "Sign in",
        onClick: onSignIn,
        icon: (active) => <UserIcon active={active} />,
      },
    ];
  }, [isAuthenticated, onSignIn, showSkeleton]);

  const isActive = useCallback(
    (item: NavItem) => {
      if (item.match) {
        return item.match(pathname, hash);
      }
      if (!item.href) return false;
      const [hrefPath] = item.href.split("#");
      if (hrefPath === "/m/dashboard") {
        return pathname === "/m" || pathname === "/m/dashboard";
      }
      return pathname.startsWith(hrefPath);
    },
    [hash, pathname],
  );

  return (
    <nav
      aria-label="Mobile primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#05050b]/90 pb-[env(safe-area-inset-bottom)] shadow-[0_-18px_48px_rgba(5,5,11,0.65)] backdrop-blur supports-[backdrop-filter]:bg-[#05050b]/75"
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between px-2 py-1.5 sm:hidden min-h-[3.25rem]">
        {showSkeleton ? (
          <div className="flex w-full items-center justify-between gap-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="flex w-full flex-col items-center gap-1.5 rounded-xl px-2 py-1">
                <span className="flex h-8 w-8 items-center justify-center rounded-full">
                  <span className="skeleton skeleton-circle h-8 w-8" />
                </span>
                <span className="skeleton skeleton-line h-2.5 w-10" />
              </div>
            ))}
          </div>
        ) : (
          navItems.map((item) => {
            const active = isActive(item);
            const content = (
              <>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 transition ${
                    active ? "bg-white/15 text-white" : "text-white/70 hover:text-white hover:border-white/20"
                  }`}
                >
                  {item.icon(active)}
                </span>
                <span className={`leading-4 text-[11px] ${active ? "text-white" : "text-white/75"}`}>{item.label}</span>
              </>
            );

            if (item.href) {
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex w-full flex-col items-center gap-1.5 rounded-xl px-2 py-1 text-[11px] font-medium transition min-h-[3rem] ${
                    active ? "text-white" : "text-white/70 hover:text-white"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={item.key}
                type="button"
                onClick={item.onClick}
                className="flex w-full flex-col items-center gap-1.5 rounded-xl px-2 py-1 text-[11px] font-medium text-white/70 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 min-h-[3rem]"
              >
                {content}
              </button>
            );
          })
        )}
      </div>
    </nav>
  );
}
