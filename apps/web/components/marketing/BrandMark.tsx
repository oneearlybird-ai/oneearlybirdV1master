"use client";

import Link from "next/link";
import Image from "next/image";
import LogoLockup from "@/public/brand/header-lockup.png";

type BrandMarkProps = {
  href?: string;
};

export default function BrandMark({ href = "/" }: BrandMarkProps) {
  return (
    <Link
      href={href}
      aria-label="EarlyBird AI home"
      className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05050b]"
    >
      <Image
        src={LogoLockup}
        alt="EarlyBird AI"
        priority
        width={368}
        height={123}
        className="h-12 w-auto"
      />
    </Link>
  );
}
