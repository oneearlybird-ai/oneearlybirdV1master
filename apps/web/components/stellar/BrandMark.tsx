"use client";

import Image from "next/image";
import Link from "next/link";

type BrandMarkProps = {
  href?: string;
};

export default function BrandMark({ href = "/" }: BrandMarkProps) {
  return (
    <Link
      href={href}
      aria-label="EarlyBird AI home"
      className="inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05050b]"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-white/20 via-white/10 to-transparent ring-1 ring-white/15 shadow-[0_20px_60px_rgba(59,130,246,0.35)]">
        <Image
          src="/brand/logo.png"
          alt="EarlyBird AI"
          width={80}
          height={80}
          className="h-8 w-auto"
          priority
        />
      </span>
      <span className="hidden text-lg font-semibold tracking-tight text-white/90 sm:inline">
        EarlyBird AI
      </span>
    </Link>
  );
}
