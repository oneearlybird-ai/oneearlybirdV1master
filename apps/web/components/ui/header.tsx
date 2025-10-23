import Link from "next/link";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";
import { AccountDropdown } from "@/components/navigation/AccountDropdown";
import SignOutButton from "@/components/auth/SignOutButton";
import Logo from "./logo";
import MobileMenu from "./mobile-menu";
import MarketingAuthControls from "@/components/navigation/MarketingAuthControls";

export default function Header() {
  const { status } = useAuthSession();
  const isAuthenticated = status === "authenticated";

  return (
    <header className="absolute inset-x-0 z-30">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 md:py-6">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          <Link className="rounded-xl px-4 py-2 text-sm font-medium text-white/70 transition hover:text-white" href="/">
            Home
          </Link>
          <Link className="rounded-xl px-4 py-2 text-sm font-medium text-white/70 transition hover:text-white" href="/how-it-works">
            How it works
          </Link>
          <Link className="rounded-xl px-4 py-2 text-sm font-medium text-white/70 transition hover:text-white" href="/pricing">
            Pricing
          </Link>
          <Link className="rounded-xl px-4 py-2 text-sm font-medium text-white/70 transition hover:text-white" href="/preview">
            Preview
          </Link>
          <Link className="rounded-xl px-4 py-2 text-sm font-medium text-white/70 transition hover:text-white" href="/docs">
            Docs
          </Link>
          <Link className="rounded-xl px-4 py-2 text-sm font-medium text-white/70 transition hover:text-white" href="/support">
            Support
          </Link>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <AccountDropdown />
              <SignOutButton variant="ghost" />
            </div>
          ) : (
            <MarketingAuthControls />
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {isAuthenticated ? (
            <AccountDropdown />
          ) : status === "loading" ? (
            <span className="text-sm text-white/70">Checking session…</span>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                className="inline-flex items-center justify-center rounded-lg border border-white/20 px-3 py-1.5 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white"
                href="/login"
              >
                Sign in
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-black transition hover:bg-white/90"
                href="/login?tab=signup"
              >
                Sign up
              </Link>
            </div>
          )}
          <MobileMenu isAuthenticated={isAuthenticated} />
        </div>
      </div>
    </header>
  );
}
