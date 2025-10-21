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

      {/*Mobile navigation */}
      <nav
        id="mobile-nav"
        ref={mobileNav}
        className="absolute top-full z-20 left-0 w-full px-4 sm:px-6 overflow-hidden transition-all duration-300 ease-in-out"
        style={mobileNavOpen ? { maxHeight: mobileNav.current?.scrollHeight, opacity: 1 } : { maxHeight: 0, opacity: 0.8 }}
      >
        <ul className="border border-transparent [background:linear-gradient(var(--color-slate-900),var(--color-slate-900))_padding-box,conic-gradient(var(--color-slate-400),var(--color-slate-700)_25%,var(--color-slate-700)_75%,var(--color-slate-400)_100%)_border-box] rounded-lg px-4 py-1.5 space-y-0.5">
          <li>
            <Link className="flex font-medium text-sm text-slate-300 hover:text-white py-1.5" href="/">Home</Link>
          </li>
          <li>
            <Link className="flex font-medium text-sm text-slate-300 hover:text-white py-1.5" href="/how-it-works">How it works</Link>
          </li>
          <li>
            <Link className="flex font-medium text-sm text-slate-300 hover:text-white py-1.5" href="/pricing">Pricing</Link>
          </li>
          <li>
            <Link className="flex font-medium text-sm text-slate-300 hover:text-white py-1.5" href="/preview">Preview</Link>
          </li>
          <li>
            <Link className="flex font-medium text-sm text-slate-300 hover:text-white py-1.5" href="/docs">Docs</Link>
          </li>
          <li>
            <Link className="flex font-medium text-sm text-slate-300 hover:text-white py-1.5" href="/support">Support</Link>
          </li>
          {isAuthenticated ? (
            <li className="border-t border-slate-800 mt-2 pt-3 flex flex-col gap-2">
              <Link className="flex h-11 items-center justify-center rounded-xl border border-white/15 text-sm font-semibold text-white/85 transition hover:text-white" href={dashboardHref} onClick={() => setMobileNavOpen(false)}>
                Dashboard
              </Link>
              <SignOutButton fullWidth variant="ghost" className="h-11 border-white/20 text-white/85 hover:text-white" onBeforeSignOut={() => setMobileNavOpen(false)} />
            </li>
          ) : (
            <li className="border-t border-slate-800 mt-2 pt-3 flex gap-2">
              <AuthModalTriggerButton mode="signin" className="flex-1 btn text-slate-200 hover:text-white bg-slate-900/30">Sign in</AuthModalTriggerButton>
              <AuthModalTriggerButton mode="signup" className="flex-1 btn text-slate-900 bg-linear-to-r from-white/80 via-white to-white/80 hover:bg-white">Start trial</AuthModalTriggerButton>
            </li>
          )}

        </ul>
      </nav>
    </div>
  )
}
