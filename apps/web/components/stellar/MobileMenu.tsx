"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { NavItem } from "./types";
import StellarAuthControls from "@/components/navigation/StellarAuthControls";

type MobileMenuProps = {
  items: NavItem[];
  onClose: () => void;
};

export default function MobileMenu({ items, onClose }: MobileMenuProps) {
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#05050b] px-5 pb-6 pt-[calc(env(safe-area-inset-top)+1.25rem)] lg:hidden">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 text-white/70 transition hover:text-white hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05050b]"
          aria-label="Close menu"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
            <path d="M7 7l10 10M17 7 7 17" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <nav className="mt-6 flex flex-col gap-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-base font-medium text-white/90 transition hover:border-white/20 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-6">
        <StellarAuthControls variant="mobile" onNavigate={onClose} />
      </div>
    </div>
  );
}
