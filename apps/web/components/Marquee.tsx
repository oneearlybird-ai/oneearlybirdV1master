"use client";

import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  speedSec?: number; // reserved for future class-based speeds
  ariaLabel?: string;
};

// CSS-only marquee: duplicates children in a single track; animation handled in globals.css
export function Marquee({ children, ariaLabel }: Props) {
  return (
    <div className="eb-marquee" aria-label={ariaLabel} role="marquee">
      <div className="eb-marquee-track">
        <div className="flex items-center gap-3 md:gap-5">
          {children}
          {children}
        </div>
      </div>
    </div>
  );
}
