"use client";

import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  speedSec?: number; // loop duration in seconds
  ariaLabel?: string;
};

// CSS-only marquee using duplicated tracks; pausable on hover; reduced motion aware via globals.css
export function Marquee({ children, speedSec = 16, ariaLabel }: Props) {
  return (
    <div className="eb-marquee" aria-label={ariaLabel} role="marquee">
      <div className="eb-marquee-track" data-speed={speedSec}>
        <div className="flex items-center gap-3 md:gap-5 min-w-max">{children}</div>
        {/* Seam gap: ensure spacing between end of set A and start of set B */}
        <div className="flex items-center gap-3 md:gap-5 min-w-max ml-3" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
