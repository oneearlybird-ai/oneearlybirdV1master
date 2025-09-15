"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function AuthControls({ hasSession }: { hasSession: boolean }) {
  if (hasSession) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90">Dashboard</Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="hidden md:inline rounded-xl border border-white/20 px-4 py-2 text-sm text-white/80 hover:text-white"
          type="button"
        >
          Sign out
        </button>
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

