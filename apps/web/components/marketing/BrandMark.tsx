"use client";

import Link from "next/link";
import BirdMark from "@/components/ui/BirdMark";

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
      <BirdMark className="h-12 w-12" size={48} alt="EarlyBird AI bird mark" />
      <span className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
        EarlyBird <span className="text-purple-300">AI</span>
      </span>
    </Link>
  );
}
