"use client";

import React from "react";

// Fixed, non-interactive microchip in the top-right corner of the viewport.
// Sits above the black background but below the header (header has z-20).
export function MicrochipCornerOverlay() {
  return (
    <div className="fixed top-6 right-4 md:top-8 md:right-8 z-10 pointer-events-none select-none opacity-80">
      <svg
        width="180"
        height="120"
        viewBox="0 0 180 120"
        aria-hidden
        className="drop-shadow-[0_0_12px_rgba(124,240,255,0.12)]"
      >
        <defs>
          <filter id="chipGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Chip body */}
        <rect x="20" y="16" width="140" height="88" rx="8" ry="8" fill="#0f1218" stroke="#1b2230" strokeWidth="2" filter="url(#chipGlow)" />

        {/* Pins left */}
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={`pl-${i}`} x="10" y={22 + i * 6} width="10" height="3" fill="#1b2230" />
        ))}
        {/* Pins right */}
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={`pr-${i}`} x="160" y={22 + i * 6} width="10" height="3" fill="#1b2230" />
        ))}

        {/* Subtle top highlight */}
        <rect x="24" y="20" width="132" height="10" rx="4" fill="url(#topHL)" opacity="0.25" />
        <defs>
          <linearGradient id="topHL" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#3a4a60" />
            <stop offset="50%" stopColor="#6c7b8f" />
            <stop offset="100%" stopColor="#3a4a60" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

