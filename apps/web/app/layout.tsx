import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "EarlyBird",
  description: "AI voice receptionist for your business",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-white">
        {/* Sticky Nav */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="inline-block h-6 w-6 rounded bg-white"></span>
              EarlyBird
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/pricing" className="text-white/80 hover:text-white">Pricing</Link>
              <Link href="/roi" className="text-white/80 hover:text-white">ROI</Link>
              <Link href="/docs" className="text-white/80 hover:text-white">Docs</Link>
              <Link href="/support" className="text-white/80 hover:text-white">Support</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden md:inline rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 hover:text-white"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </header>

        <main className="min-h-dvh">{children}</main>

        {/* Footer */}
        <footer className="border-t border-white/10 mt-16">
          <div className="mx-auto max-w-6xl flex flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
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
