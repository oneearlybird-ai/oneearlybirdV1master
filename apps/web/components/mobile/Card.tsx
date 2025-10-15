"use client";

import type { ReactNode } from "react";

export function MobileCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-sm ring-1 ring-white/5 ${className}`}
    >
      {children}
    </div>
  );
}

export function MobileCardHeader({ title, subtitle }: { title: ReactNode; subtitle?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 text-white">
      <div className="text-base font-semibold leading-tight">{title}</div>
      {subtitle ? <div className="text-sm text-white/60">{subtitle}</div> : null}
    </div>
  );
}

export function MobileCardContent({ children }: { children: ReactNode }) {
  return <div className="mt-3 text-sm text-white/75">{children}</div>;
}

export function MobileCardFooter({ children }: { children: ReactNode }) {
  return <div className="mt-4 flex flex-wrap gap-2">{children}</div>;
}
