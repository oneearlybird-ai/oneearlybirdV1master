'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuthSession } from '@/components/auth/AuthSessionProvider'
import SignOutButton from '@/components/auth/SignOutButton'
import { getDashboardPath } from '@/lib/authPaths'
import AuthModalTriggerButton from '@/components/auth/AuthModalTriggerButton'

export default function MobileMenu() {
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false)
  const { status } = useAuthSession()
  const isAuthenticated = status === 'authenticated'
  const dashboardHref = getDashboardPath()

  const trigger = useRef<HTMLButtonElement>(null)
  const mobileNav = useRef<HTMLDivElement>(null)

  // close the mobile menu on click outside
  useEffect(() => {
    const clickHandler = ({ target }: { target: EventTarget | null }): void => {
      if (!mobileNav.current || !trigger.current) return;
      if (!mobileNavOpen || mobileNav.current.contains(target as Node) || trigger.current.contains(target as Node)) return;
      setMobileNavOpen(false)
    };
    document.addEventListener('click', clickHandler)
    return () => document.removeEventListener('click', clickHandler)
  })

  // close the mobile menu if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: { keyCode: number }): void => {
      if (!mobileNavOpen || keyCode !== 27) return;
      setMobileNavOpen(false)
    };
    document.addEventListener('keydown', keyHandler)
    return () => document.removeEventListener('keydown', keyHandler)
  })

  return (
    <div className="md:hidden flex items-center ml-4">
      {/* Hamburger button */}
      <button
        ref={trigger}
        className={`group inline-flex w-8 h-8 text-slate-300 hover:text-white text-center items-center justify-center transition`}
        aria-controls="mobile-nav"
        aria-expanded={mobileNavOpen}
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
      >
        <span className="sr-only">Menu</span>
        <svg className="w-4 h-4 fill-current pointer-events-none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <rect 
            className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] -translate-y-[5px] group-aria-expanded:rotate-[315deg] group-aria-expanded:translate-y-0"
            y="7" 
            width="16" 
            height="2" 
            rx="1"
          />
          <rect 
            className="origin-center group-aria-expanded:rotate-45 transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)]"
            y="7" 
            width="16" 
            height="2" 
            rx="1"
          />
          <rect 
            className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] translate-y-[5px] group-aria-expanded:rotate-[135deg] group-aria-expanded:translate-y-0"
            y="7" 
            width="16" 
            height="2" 
            rx="1"
          />
        </svg>
      </button>

      {/* Mobile navigation */}
      <nav
        id="mobile-nav"
        ref={mobileNav}
        className="absolute top-full z-20 right-4 sm:right-6 mt-3 w-[min(22rem,calc(100vw-2.5rem))] overflow-hidden rounded-3xl border border-white/12 bg-[#05050b]/98 px-1 py-2 shadow-[0_30px_90px_rgba(5,5,11,0.55)] backdrop-blur transition-all duration-300 ease-in-out"
        style={mobileNavOpen ? { maxHeight: mobileNav.current?.scrollHeight, opacity: 1 } : { maxHeight: 0, opacity: 0.8 }}
      >
        <ul className="flex flex-col gap-1 px-2 py-1.5">
          <li>
            <Link className="flex items-center rounded-2xl px-3 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white" href="/" onClick={() => setMobileNavOpen(false)}>
              Home
            </Link>
          </li>
          <li>
            <Link className="flex items-center rounded-2xl px-3 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white" href="/how-it-works" onClick={() => setMobileNavOpen(false)}>
              How it works
            </Link>
          </li>
          <li>
            <Link className="flex items-center rounded-2xl px-3 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white" href="/pricing" onClick={() => setMobileNavOpen(false)}>
              Pricing
            </Link>
          </li>
          <li>
            <Link className="flex items-center rounded-2xl px-3 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white" href="/preview" onClick={() => setMobileNavOpen(false)}>
              Preview
            </Link>
          </li>
          <li>
            <Link className="flex items-center rounded-2xl px-3 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white" href="/docs" onClick={() => setMobileNavOpen(false)}>
              Docs
            </Link>
          </li>
          <li>
            <Link className="flex items-center rounded-2xl px-3 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white" href="/support" onClick={() => setMobileNavOpen(false)}>
              Support
            </Link>
          </li>
          {isAuthenticated ? (
            <li className="border-t border-white/10 mt-3 pt-3 flex flex-col gap-2 px-1">
              <Link className="flex h-11 items-center justify-center rounded-2xl border border-white/15 text-sm font-semibold text-white/85 transition hover:bg-white/10 hover:text-white" href={dashboardHref} onClick={() => setMobileNavOpen(false)}>
                Dashboard
              </Link>
              <SignOutButton
                fullWidth
                variant="ghost"
                className="h-11 rounded-2xl border border-white/15 text-white/80 hover:bg-rose-500/15 hover:text-rose-100"
                onBeforeSignOut={() => setMobileNavOpen(false)}
              />
            </li>
          ) : (
            <li className="border-t border-white/10 mt-3 pt-3 flex gap-2 px-1">
              <AuthModalTriggerButton
                mode="signin"
                className="flex-1 h-11 rounded-2xl border border-white/15 bg-transparent text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Sign in
              </AuthModalTriggerButton>
              <AuthModalTriggerButton
                mode="signup"
                className="flex-1 h-11 rounded-2xl bg-white text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Start trial
              </AuthModalTriggerButton>
            </li>
          )}

        </ul>
      </nav>
    </div>
  )
}
