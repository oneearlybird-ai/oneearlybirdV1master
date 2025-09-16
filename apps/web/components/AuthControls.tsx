"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

export default function AuthControls({ hasSession }: { hasSession: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  if (hasSession) {
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(v => !v)}
          className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          Dashboard
        </button>
        {open ? (
          <div role="menu" className="absolute right-0 mt-2 w-44 rounded-xl border border-white/15 bg-neutral-950/95 backdrop-blur p-1 shadow-lg">
            <Link role="menuitem" href="/dashboard" className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white">Overview</Link>
            <Link role="menuitem" href="/dashboard/billing" className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white">Billing</Link>
            <Link role="menuitem" href="/dashboard/settings" className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white">Settings</Link>
            <button role="menuitem" onClick={() => signOut({ callbackUrl: "/" })} className="block w-full text-left rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white">Sign out</button>
          </div>
        ) : null}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <Link href="/login" className="hidden md:inline rounded-xl border border-white/20 px-4 py-2 text-sm text-white/80 hover:text-white">Log in</Link>
      <Link href="/signup" className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90">Get Started</Link>
    </div>
  );
}
