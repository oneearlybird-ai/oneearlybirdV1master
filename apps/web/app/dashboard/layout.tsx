import React from "react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[960px] mx-auto p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="m-0 text-lg">EarlyBird Dashboard</h1>
        <nav className="flex gap-4">
          <Link href="/dashboard">Overview</Link>
          <Link href="/dashboard/usage">Usage</Link>
          <Link href="/dashboard/billing">Billing</Link>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
