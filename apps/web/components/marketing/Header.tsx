"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import BrandMark from "./BrandMark";
import MarketingAuthControls from "@/components/navigation/MarketingAuthControls";
import MobileMenu from "./MobileMenu";
import type { NavItem } from "./types";

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/support", label: "Support" },
];

export default function MarketingHeader() {
  const pathname = usePathname() || "/";
  const [menuOpen, setMenuOpen] = useState(false);

  const activeHref = useMemo(() => pathname.replace(/\/$/, "") || "/", [pathname]);

  return (
    <header className="relative z-40 border-b border-white/5 bg-transparent">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/4 via-white/0 to-transparent" />
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 md:px-6 lg:py-6">
        <BrandMark />
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => {
            const normalized = item.href === "/" ? "/" : item.href.replace(/\/$/, "");
            const isActive = activeHref === normalized || (normalized !== "/" && activeHref.startsWith(normalized));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition hover:text-white ${
                  isActive ? "text-white" : "text-white/70"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden lg:flex lg:items-center lg:gap-4">
          <MarketingAuthControls />
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 text-white/80 transition hover:border-white/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05050b] lg:hidden"
          aria-label="Open navigation"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {menuOpen ? <MobileMenu items={NAV_ITEMS} onClose={() => setMenuOpen(false)} /> : null}
    </header>
  );
}
