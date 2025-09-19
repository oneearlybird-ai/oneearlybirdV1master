import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import AuthControls from "@/components/AuthControls";
import SupportDrawer from "@/components/SupportDrawer";
import RevealOnScroll from "@/components/RevealOnScroll";
import ScrollHeaderElevator from "@/components/ScrollHeaderElevator";
import BackToTop from "@/components/BackToTop";
import NavMainLinks from "@/components/NavMainLinks";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "EarlyBird",
  description: "AI voice receptionist for your business",
};

// Ensure header reflects session cookies on every request (no static caching)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = cookies();
  const hasSession = !!(cookieStore.get("__Secure-next-auth.session-token") || cookieStore.get("next-auth.session-token"));
  return (
    <html lang="en">
      <body className="min-h-dvh flex flex-col bg-neutral-950 text-white">
        <a href="#content" className="skip-link">Skip to content</a>
        <RevealOnScroll />
        {/* Header */}
        <ScrollHeaderElevator />
        <header id="eb-header" className="eb-header sticky top-0 z-40 border-b border-white/10 bg-neutral-950/75 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/55">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight" aria-label="EarlyBird home">
              <img
                srcSet="/brand/logo.png 1x, /brand/logo@2x.png 2x, /brand/logo@3x.png 3x"
                src="/brand/logo.png"
                alt="EarlyBird"
                className="h-[3em] w-auto align-text-bottom"
              />
            </Link>
            <NavMainLinks />
            <div className="flex items-center gap-3">
              <SupportDrawer />
              <AuthControls hasSession={hasSession} />
            </div>
          </nav>
        </header>

        {/* Main content */}
        <main id="content" className="flex-1">{children}</main>
        <BackToTop />

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
        {/* Vercel Analytics */}
        <Analytics />
      </body>
    </html>
  );
}
