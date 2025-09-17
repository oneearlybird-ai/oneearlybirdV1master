"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "#how", label: "How it works", type: "hash" as const },
  { href: "#integrations", label: "Integrations", type: "hash" as const },
  { href: "/pricing", label: "Pricing" },
  { href: "/roi", label: "ROI" },
  { href: "/docs", label: "Docs" },
  { href: "/support", label: "Support" },
];

export default function NavMainLinks() {
  const pathname = usePathname() || "/";
  return (
    <div className="hidden md:flex items-center gap-6 text-sm">
      {LINKS.map((l) => {
        const isHash = l.type === "hash";
        const href = (isHash && pathname !== "/") ? ("/" + l.href) : l.href;
        const current = !isHash && pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={current ? "page" : undefined}
            className={`text-white/80 hover:text-white${current ? " underline" : ""}`}
          >
            {l.label}
          </Link>
        );
      })}
    </div>
  );
}
