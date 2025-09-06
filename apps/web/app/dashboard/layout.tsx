import React from "react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>EarlyBird Dashboard</h1>
        <nav style={{ display: "flex", gap: 16 }}>
          <Link href="/dashboard">Overview</Link>
          <Link href="/dashboard/usage">Usage</Link>
          <Link href="/dashboard/billing">Billing</Link>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
