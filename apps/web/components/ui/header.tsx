import Link from "next/link";
import AuthModalTriggerButton from "@/components/auth/AuthModalTriggerButton";
import Logo from "./logo";
import MobileMenu from "./mobile-menu";

export default function Header() {
  return (
    <header className="absolute w-full z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Site branding */}
          <div className="flex-1">
            <Logo />
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex md:grow">

            {/* Desktop menu links */}
            <ul className="flex grow justify-center flex-wrap items-center">
              <li>
                <Link
                  className="font-medium text-sm text-slate-300 hover:text-white mx-4 lg:mx-5 transition duration-150 ease-in-out"
                  href="/"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  className="font-medium text-sm text-slate-300 hover:text-white mx-4 lg:mx-5 transition duration-150 ease-in-out"
                  href="/how-it-works"
                >
                  How it works
                </Link>
              </li>
              <li>
                <Link
                  className="font-medium text-sm text-slate-300 hover:text-white mx-4 lg:mx-5 transition duration-150 ease-in-out"
                  href="/pricing"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  className="font-medium text-sm text-slate-300 hover:text-white mx-4 lg:mx-5 transition duration-150 ease-in-out"
                  href="/docs"
                >
                  Docs
                </Link>
              </li>
              <li>
                <Link
                  className="font-medium text-sm text-slate-300 hover:text-white mx-4 lg:mx-5 transition duration-150 ease-in-out"
                  href="/support"
                >
                  Support
                </Link>
              </li>
            </ul>

          </nav>

          {/* Desktop sign in links */}
          <ul className="flex-1 flex justify-end items-center">
            <li>
              <AuthModalTriggerButton
                mode="signin"
                className="font-medium text-sm text-slate-300 hover:text-white whitespace-nowrap transition duration-150 ease-in-out"
              >
                Sign in
              </AuthModalTriggerButton>
            </li>
            <li className="ml-6">
              <AuthModalTriggerButton
                mode="signup"
                className="btn-sm text-slate-300 hover:text-white transition duration-150 ease-in-out w-full group [background:linear-gradient(var(--color-slate-900),var(--color-slate-900))_padding-box,conic-gradient(var(--color-slate-400),var(--color-slate-700)_25%,var(--color-slate-700)_75%,var(--color-slate-400)_100%)_border-box] relative before:absolute before:inset-0 before:bg-slate-800/30 before:rounded-full before:pointer-events-none"
              >
                <span className="relative inline-flex items-center">
                  Sign up{" "}
                  <span className="tracking-normal text-purple-500 group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-1">
                    -&gt;
                  </span>
                </span>
              </AuthModalTriggerButton>
            </li>
          </ul>

          <MobileMenu />

        </div>
      </div>
    </header>
  )
}
