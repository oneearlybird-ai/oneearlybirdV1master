"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: (active: boolean) => ReactNode;
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

const NAV_ITEMS: NavItem[] = [
    { href: "/m/dashboard", label: "Home", icon: (active) => <HomeIcon active={active} /> },
    { href: "/m/dashboard/calls", label: "Calls", icon: (active) => <CallsIcon active={active} /> },
    { href: "/m/dashboard/appointments", label: "Appts", icon: (active) => <CalendarIcon active={active} /> },
    { href: "/m/dashboard/phone", label: "Phone", icon: (active) => <PhoneIcon active={active} /> },
    { href: "/m/dashboard/billing", label: "Billing", icon: (active) => <BillingIcon active={active} /> },
];

export default function MobileBottomNav() {
  const pathname = usePathname() || "/";

  const matches = (href: string) => {
    if (href === "/m/dashboard") {
      return pathname === "/m" || pathname === "/m/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      aria-label="Mobile primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-neutral-950/95 shadow-[0_-12px_32px_rgba(0,0,0,0.45)] backdrop-blur supports-[backdrop-filter]:bg-neutral-950/80"
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 sm:hidden">
        {NAV_ITEMS.map((item) => {
          const active = matches(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex w-full flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition ${
                active ? "text-white" : "text-white/70 hover:text-white"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-full ${active ? "bg-white/10" : ""}`}>
                {item.icon(active)}
              </span>
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
