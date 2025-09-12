import React from "react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="m-0 text-lg font-medium tracking-tight">EarlyBird Dashboard</h1>
        <nav className="flex gap-4 text-sm">
          <Link className="text-white/80 hover:text-white" href="/dashboard">Overview</Link>
          <Link className="text-white/80 hover:text-white" href="/dashboard/usage">Usage</Link>
          <Link className="text-white/80 hover:text-white" href="/dashboard/billing">Billing</Link>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
