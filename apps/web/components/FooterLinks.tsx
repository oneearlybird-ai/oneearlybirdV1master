"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function FooterLinks() {
  const pathname = usePathname() || "/";
  const items = [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/docs", label: "Docs" },
    { href: "/support", label: "Support" },
  ];
  return (
    <div className="flex gap-6 text-sm">
      {items.map((i) => {
        const current = pathname === i.href;
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={current ? 'page' : undefined}
            className="footer-link"
          >
            {i.label}
          </Link>
        );
      })}
    </div>
  );
}
