import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "EarlyBird",
  description: "AI voice receptionist for your business",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const isPreview = process.env.VERCEL_ENV === 'preview' || process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';
  const cookieStore = cookies();
  const hasSession = !!(cookieStore.get("__Secure-next-auth.session-token") || cookieStore.get("next-auth.session-token"));
  return (
    <html lang="en">
      <body className="min-h-dvh flex flex-col bg-neutral-950 text-white">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-white/10 bg-neutral-950/75 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/55">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight" aria-label="EarlyBird home">
              <img
                srcSet="/brand/logo.png 1x, /brand/logo@2x.png 2x, /brand/logo@3x.png 3x"
                src="/brand/logo.png"
                alt="EarlyBird"
                className="h-[3em] w-auto align-text-bottom"
              />
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <Link href="#how" className="text-white/80 hover:text-white">How it works</Link>
              <Link href="#integrations" className="text-white/80 hover:text-white">Integrations</Link>
              <Link href="/pricing" className="text-white/80 hover:text-white">Pricing</Link>
              <Link href="/roi" className="text-white/80 hover:text-white">ROI</Link>
              <Link href="/docs" className="text-white/80 hover:text-white">Docs</Link>
              <Link href="/support" className="text-white/80 hover:text-white">Support</Link>
              {isPreview ? (
                <>
                  <Link href="/preview" className="text-amber-300/80 hover:text-amber-300">UX Preview</Link>
                  <Link href="/dashboard-preview" className="text-amber-300/80 hover:text-amber-300">Dashboard Preview</Link>
                </>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              {hasSession ? (
                <Link href="/dashboard" className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90">Dashboard</Link>
              ) : (
                <>
                  <Link href="/login" className="hidden md:inline rounded-xl border border-white/20 px-4 py-2 text-sm text-white/80 hover:text-white">Log in</Link>
                  <Link href="/signup" className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90">Get Started</Link>
                </>
              )}
            </div>
          </nav>
        </header>

        {/* Main content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-white/10 mt-12">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-white/60">
              © {new Date().getFullYear()} EarlyBird, Inc.
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-white/70 hover:text-white">Privacy</Link>
              <Link href="/terms" className="text-white/70 hover:text-white">Terms</Link>
              <Link href="/docs" className="text-white/70 hover:text-white">Docs</Link>
              <Link href="/support" className="text-white/70 hover:text-white">Support</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
