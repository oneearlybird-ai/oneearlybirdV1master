"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const LINKS = [
  { href: "#how", label: "How it works", type: "hash" as const },
  { href: "#integrations", label: "Integrations", type: "hash" as const },
  { href: "/pricing", label: "Pricing" },
  { href: "/roi", label: "ROI" },
  { href: "/docs", label: "Docs" },
  { href: "/support", label: "Support" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstFocusRef = useRef<HTMLButtonElement | null>(null);
  const pathname = usePathname() || "/";

  const close = useCallback(() => setOpen(false), []);
  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false); }
  }, []);

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Focus trap basics
    firstFocusRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onKeyDown]);

  return (
    <>
      <button
        ref={firstFocusRef}
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="md:hidden rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:text-white"
        onClick={() => setOpen(true)}
      >
        Menu
      </button>

      {open ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title" ref={dialogRef}>
          <div className="absolute inset-0 bg-black/60 eb-overlay-in" onClick={close} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-xs bg-neutral-950 border-l border-white/10 shadow-xl eb-drawer-in">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <h2 id="mobile-menu-title" className="font-medium">Menu</h2>
              <button type="button" onClick={close} className="rounded border border-white/20 px-2 py-1 text-xs text-white/80 hover:text-white">Close</button>
            </div>
            <nav className="p-4 flex flex-col gap-2">
              {LINKS.map((l) => {
                const isHash = l.type === 'hash';
                const href = (isHash && pathname !== '/') ? ('/' + l.href) : l.href as string;
                const current = !isHash && pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={current ? 'page' : undefined}
                    className="rounded-lg px-3 py-2 text-white/80 hover:text-white hover:bg-white/[0.06]"
                    onClick={close}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      ) : null}
    </>
  );
}

