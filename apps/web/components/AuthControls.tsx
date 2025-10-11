"use client";
import Link from "next/link";
import { API_BASE } from "@/lib/config";
import { redirectTo } from "@/lib/clientNavigation";

export default function AuthControls({ hasSession }: { hasSession: boolean }) {

  function apiUrl(path: string) {
    const base = (API_BASE || "").replace(/\/+$/, "");
    if (base) return `${base}${path}`;
    return `/api/upstream${path}`;
  }

  async function handleSignOut() {
    try {
      await fetch(apiUrl("/auth/logout"), {
        method: "POST",
        credentials: "include"
      });
    } catch {
      // ignore network errors; we still redirect below
    } finally {
      redirectTo("/");
    }
  }

  if (hasSession) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="rounded-xl border border-white/20 px-4 py-2 text-sm text-white/80 hover:text-white"
        >
          Dashboard
        </Link>
        <button
          onClick={() => {
            void handleSignOut();
          }}
          className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90"
        >
          Sign out
        </button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <Link href="/login" className="rounded-xl border border-white/20 px-4 py-2 text-sm text-white/80 hover:text-white">Log in</Link>
      <Link href="/signup" className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90">Get Started</Link>
    </div>
  );
}
