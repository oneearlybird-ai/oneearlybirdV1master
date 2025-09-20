"use client";

import Link from "next/link";
import Toasts from "@/components/Toasts";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [live, setLive] = useState(true);
  const [unread, setUnread] = useState(0);
  const [build, setBuild] = useState<string|undefined>(undefined);
  const searchRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch('/api/usage/summary', { cache: 'no-store' })
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
  const pathname = usePathname();
  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
    return (
      <Link href={href} className={`block rounded-lg px-3 py-2 text-sm hover:text-white hover:bg-white/5 ${isActive ? 'bg-white/10 text-white' : 'text-white/80'}`} aria-current={isActive ? 'page' : undefined}>{label}</Link>
    );
  };
  return (
    <div className="min-h-dvh bg-neutral-950 text-white">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-[240px,1fr] gap-0">
        <aside className="border-r border-white/10 hidden md:block">
          <div className="p-4">
            <div className="text-sm uppercase tracking-wide text-white/50 mb-2">EarlyBird</div>
            <nav className="space-y-1">
              <NavLink href="/dashboard" label="Dashboard" />
              <NavLink href="/dashboard/calls" label="Calls & Recordings" />
              <NavLink href="/dashboard/appointments" label="Appointments" />
              <NavLink href="/dashboard/integrations" label="Integrations" />
              <NavLink href="/dashboard/billing" label="Billing & Plan" />
              <NavLink href="/dashboard/settings" label="Settings" />
            </nav>
          </div>
        </aside>
        <div>
          <div className="sticky top-0 z-30 border-b border-white/10 bg-neutral-950/75 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/55">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2 text-sm">
                <span className={`inline-flex h-2 w-2 rounded-full ${live ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <span className="text-white/70">{live ? 'AI Receptionist: Live' : 'AI Receptionist: Paused'}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => alert('Test call triggered (preview).')} className="rounded-md bg-white text-black px-3 py-1.5 text-sm font-medium hover:bg-white/90">Test Call</button>
                <button onClick={() => setLive(v => !v)} className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:text-white">{live ? 'Pause' : 'Go Live'}</button>
                <button
                  onClick={() => { setUnread(0); try { sessionStorage.setItem('eb_unread_demo','0'); } catch (e) { void e; } }}
                  className="relative rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:text-white"
                  aria-label="Updates"
                >
                  Updates
                  {unread > 0 ? (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-4 min-w-[1rem] rounded-full bg-amber-400 text-black text-[10px] px-1">
                      {unread}
                    </span>
                  ) : null}
                </button>
                <span className="hidden md:inline text-xs text-white/50">dashboard{build ? ` @ ${build}` : ''}</span>
                <input
                  ref={searchRef}
                  type="search"
                  placeholder="Search (press /)"
                  aria-label="Search"
                  className="ml-2 bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>
            </div>
          </div>
          <div className="p-4">{children}</div>
        </div>
      </div>
      <Toasts />
    </div>
  );
}
