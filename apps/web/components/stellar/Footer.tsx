"use client";

import FooterLinks from "@/components/FooterLinks";

export default function StellarFooter() {
  return (
    <footer className="relative border-t border-white/5 bg-[#05050b]/95">
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-white/5 via-white/0 to-transparent" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-12 md:flex-row md:items-end md:justify-between md:px-6">
        <div className="max-w-sm space-y-3">
          <h2 className="text-lg font-semibold text-white">EarlyBird AI</h2>
          <p className="text-sm text-white/65">
            AI receptionist, scheduling, and call intelligence that feels like a teammate — available on web and mobile.
          </p>
          <div className="text-xs text-white/40">© {new Date().getFullYear()} EarlyBird, Inc. All rights reserved.</div>
        </div>
        <div className="flex flex-col gap-4 text-sm text-white/70 md:items-end">
          <FooterLinks />
          <div className="flex gap-4">
            <a
              href="https://twitter.com/earlybird_ai"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white"
            >
              Twitter/X
            </a>
            <a
              href="mailto:hello@oneearlybird.ai"
              className="transition hover:text-white"
            >
              hello@oneearlybird.ai
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
