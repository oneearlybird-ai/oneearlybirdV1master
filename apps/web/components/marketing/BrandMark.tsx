"use client";

import Link from "next/link";
import Image from "next/image";

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
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-[0_18px_45px_rgba(99,102,241,0.35)]">
        <Image src="/brand/icon.svg" alt="EarlyBird icon" width={34} height={34} priority />
      </span>
      <Image src="/brand/wordmark.svg" alt="EarlyBird AI" width={204} height={44} priority className="hidden md:block" />
      <span className="md:hidden text-xl font-semibold tracking-tight text-white">
        EarlyBird <span className="text-purple-300">AI</span>
      </span>
    </Link>
  );
}
