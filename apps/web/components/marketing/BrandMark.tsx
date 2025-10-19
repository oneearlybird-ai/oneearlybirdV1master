"use client";

import Link from "next/link";

type BrandMarkProps = {
  href?: string;
};

export default function BrandMark({ href = "/" }: BrandMarkProps) {
  return (
    <Link
      href={href}
      aria-label="EarlyBird AI home"
      className="inline-flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05050b]"
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-lg font-semibold text-white shadow-[0_18px_45px_rgba(99,102,241,0.35)]">
        EB
      </span>
      <span className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
        EarlyBird <span className="text-purple-300">AI</span>
      </span>
    </Link>
  );
}
