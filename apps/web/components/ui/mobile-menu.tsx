'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import SignOutButton from '@/components/auth/SignOutButton'
import { getDashboardPath } from '@/lib/authPaths'
import MarketingAuthControls from '@/components/navigation/MarketingAuthControls'

export default function MobileMenu({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false)

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

  const menuItems = [
    { href: '/', label: 'Home' },
    { href: '/how-it-works', label: 'How it works' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/preview', label: 'Preview' },
    { href: '/docs', label: 'Docs' },
    { href: '/support', label: 'Support' },
  ]

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
        className="absolute top-full z-20 left-4 right-4 sm:left-6 sm:right-6 mt-3 overflow-hidden transition-all duration-300 ease-in-out"
        style={mobileNavOpen ? { maxHeight: mobileNav.current?.scrollHeight, opacity: 1 } : { maxHeight: 0, opacity: 0.8 }}
      >
        <div className="rounded-3xl border border-white/12 bg-[#05050b]/98 px-4 py-2 shadow-[0_30px_90px_rgba(5,5,11,0.55)] backdrop-blur">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  className="flex items-center rounded-2xl px-3 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 border-t border-white/10 pt-3">
            {isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <Link
                  href={getDashboardPath()}
                  className="flex h-11 items-center justify-center rounded-2xl border border-white/15 text-sm font-semibold text-white/85 transition hover:bg-white/10 hover:text-white"
                  onClick={() => setMobileNavOpen(false)}
                >
                  Dashboard
                </Link>
                <SignOutButton fullWidth variant="ghost" className="h-11 border-white/20 text-white/85 hover:text-white" onBeforeSignOut={() => setMobileNavOpen(false)} />
              </div>
            ) : (
              <MarketingAuthControls variant="mobile" onNavigate={() => setMobileNavOpen(false)} />
            )}
          </div>
        </div>
      </nav>
    </div>
  )
}
