"use client";

import { useEffect, useRef, useState } from "react";

export default function SupportDrawer() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const lastActive = useRef<HTMLElement | null>(null);

  // Escape to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Focus trap and restore
  useEffect(() => {
    if (!open) return;
    const root = ref.current;
    if (!root) return;
    const prev = (document.activeElement as HTMLElement) || null;
    lastActive.current = prev;
    const focusables = Array.from(root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    ));
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first?.focus();
    function onTrap(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      if (focusables.length === 0) return;
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first || (root?.contains(active) !== true)) { e.preventDefault(); last?.focus(); }
      } else {
        if (active === last) { e.preventDefault(); first?.focus(); }
      }
    }
    document.addEventListener('keydown', onTrap, true);
    return () => {
      document.removeEventListener('keydown', onTrap, true);
      // Restore focus to the last active element when closing
      lastActive.current && lastActive.current.focus?.();
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl border border-white/20 px-4 py-2 text-sm text-white/80 hover:text-white"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        Support
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-[70] bg-black/50 eb-overlay-in" onClick={close} aria-hidden />
          <aside
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label="Support drawer"
            className="fixed right-0 top-0 z-[80] h-dvh w-[90vw] max-w-sm border-l border-white/15 bg-neutral-950 eb-drawer-in"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="font-medium">Support</div>
              <button onClick={close} className="rounded-lg border border-white/15 px-2 py-1 text-sm text-white/70 hover:text-white">Close</button>
            </div>
        <div className="p-4 space-y-4 text-sm">
          <p className="text-white/80">We’re here to help. Choose an option:</p>
          <ul className="space-y-2">
            <li>
              <a className="block rounded-lg border border-white/15 bg-white/5 px-3 py-2 hover:bg-white/10" href="/docs">View Docs</a>
            </li>
            <li>
              <a className="block rounded-lg border border-white/15 bg-white/5 px-3 py-2 hover:bg-white/10" href="mailto:support@oneearlybird.ai">Email support@oneearlybird.ai</a>
            </li>
            <li>
              <a className="block rounded-lg border border-white/15 bg-white/5 px-3 py-2 hover:bg-white/10" href="/support/porting">Request a phone number or port</a>
            </li>
            <li>
              <a className="block rounded-lg border border-white/15 bg-white/5 px-3 py-2 hover:bg-white/10" href="/support">Support Center</a>
            </li>
            <li>
              <a className="block rounded-lg border border-white/15 bg-white/5 px-3 py-2 hover:bg-white/10" href="/status">System Status</a>
            </li>
                <li>
                  <a className="block rounded-lg border border-white/15 bg-white/5 px-3 py-2 hover:bg-white/10" href="/changelog">Changelog</a>
                </li>
              </ul>
              <div className="text-xs text-white/50">No PHI in emails. For account-specific questions, please include your org name and callback details.</div>
            </div>
          </aside>
        </>
      ) : null}
    </div>
  );
}
