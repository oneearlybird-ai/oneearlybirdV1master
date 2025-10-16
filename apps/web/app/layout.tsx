import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import Link from "next/link";
import AuthControls from "@/components/AuthControls";
import SupportDrawer from "@/components/SupportDrawer";
import RevealOnScroll from "@/components/RevealOnScroll";
import ScrollHeaderElevator from "@/components/ScrollHeaderElevator";
import BackToTop from "@/components/BackToTop";
import NavMainLinks from "@/components/NavMainLinks";
import FooterLinks from "@/components/FooterLinks";
import MobileNav from "@/components/MobileNav";
import { Analytics } from "@vercel/analytics/react";
import AuthModalProvider from "@/components/auth/AuthModalProvider";

export const metadata: Metadata = {
  title: "EarlyBird",
  description: "AI voice receptionist for your business",
};

// Ensure header reflects session cookies on every request (no static caching)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh flex flex-col bg-neutral-950 text-white">
        <AuthModalProvider>
          <a href="#content" className="skip-link">Skip to content</a>
          <RevealOnScroll />
          {/* Header */}
          <ScrollHeaderElevator />
          <header id="eb-header" className="eb-header sticky top-0 z-40 border-b border-white/10 bg-neutral-950/75 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/55">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-0.5 md:py-1">
              <Link
                href="/"
                className="flex items-center gap-2 font-semibold tracking-tight text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                aria-label="EarlyBird AI home"
              >
                <span className="text-lg font-semibold md:text-2xl" aria-hidden>EarlyBird AI</span>
                <span className="sr-only">EarlyBird AI</span>
              </Link>
              <NavMainLinks />
              <div className="flex items-center gap-3">
                <SupportDrawer />
                <AuthControls />
                <MobileNav />
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
              <FooterLinks />
            </div>
          </footer>
          {/* Vercel Analytics */}
          <Analytics />
        </AuthModalProvider>
      </body>
    </html>
  );
}
