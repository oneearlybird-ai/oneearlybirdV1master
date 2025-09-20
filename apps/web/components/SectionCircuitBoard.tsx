"use client";

import { useEffect, useRef } from "react";

// Scroll-bound circuit board overlay designed to sit inside a section.
// - No inline styles, CSP-safe
// - SVG renders copper traces + a microchip; a glow dot travels along the path
// - Progress is tied to the section's scroll position
type Variant = 'hero' | 'how';
export function SectionCircuitBoard({ variant = 'hero' }: { variant?: Variant }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const dotRef = useRef<SVGCircleElement | null>(null);
  const gradRef = useRef<SVGRadialGradientElement | null>(null);
  const totalLenRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    totalLenRef.current = path.getTotalLength();
    path.setAttribute("stroke-dasharray", `${totalLenRef.current}`);
    path.setAttribute("stroke-dashoffset", `${totalLenRef.current}`);

    function tick() {
      const wrap = wrapRef.current;
      const pth = pathRef.current;
      if (wrap && pth) {
        const rect = wrap.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const center = vh / 2;
        const range = rect.height + vh;
        const raw = (center - rect.top) / (range || 1);
        const p = Math.max(0, Math.min(1, raw));
        const len = totalLenRef.current * p;
        pth.setAttribute("stroke-dashoffset", `${totalLenRef.current - len}`);
        const pos = pth.getPointAtLength(Math.max(0, Math.min(totalLenRef.current, len)));
        if (dotRef.current) {
          dotRef.current.setAttribute("cx", String(pos.x));
          dotRef.current.setAttribute("cy", String(pos.y));
        }
        if (gradRef.current) {
          gradRef.current.setAttribute("cx", String(pos.x));
          gradRef.current.setAttribute("cy", String(pos.y));
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // Choose a path per section; straight segments with 45°/90° bends for PCB look
  const d = variant === 'hero'
    ? (
      "M980 120 " +
      "L 900 140 L 820 180 L 760 220 " +
      "L 700 260 L 660 300 L 620 340 " +
      "L 580 370 L 540 390 L 500 410 L 460 440"
    )
    : (
      // How-it-works: route from right to center with tidy jogs
      "M1050 60 " +
      "L 980 60 L 920 100 L 860 100 " +
      "L 800 140 L 720 140 L 660 180 L 600 180 " +
      "L 560 220 L 520 220 L 480 260 L 420 260"
    );

  return (
    <div ref={wrapRef} className="absolute inset-0 -z-10 pointer-events-none">
      <svg viewBox="0 0 1200 500" className="h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="copper" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#a85a2e"/>
            <stop offset="35%" stopColor="#d07a3b"/>
            <stop offset="50%" stopColor="#ffb37a"/>
            <stop offset="65%" stopColor="#d07a3b"/>
            <stop offset="100%" stopColor="#a85a2e"/>
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <radialGradient id="dotGrad" ref={gradRef as any} r="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7cf0ff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#7cf0ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Microchip (top-right-ish) */}
        <g transform={variant === 'hero' ? "translate(900,60)" : "translate(980,20)"}>
          <rect x="0" y="0" rx="6" ry="6" width="140" height="90" fill="#0f1218" stroke="#1b2230" strokeWidth="2" />
          {/* pins */}
          {Array.from({ length: 12 }).map((_, i) => (
            <rect key={`l${i}`} x="-10" y={6 + i * 6} width="10" height="3" fill="#1b2230" />
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <rect key={`r${i}`} x="140" y={6 + i * 6} width="10" height="3" fill="#1b2230" />
          ))}
        </g>

        {/* Secondary faint traces */}
        <path d="M860 120 C 780 140, 720 180, 680 220 S 600 320, 560 360" stroke="#7a4a2a" strokeOpacity="0.18" strokeWidth="2" fill="none" />
        <path d="M940 120 C 960 160, 900 200, 860 240 S 760 320, 720 360" stroke="#7a4a2a" strokeOpacity="0.14" strokeWidth="2" fill="none" />

        {/* Main copper path from chip downward with graceful bends */}
        <path ref={pathRef} d={d} stroke="url(#copper)" strokeWidth="4" fill="none" filter="url(#glow)" strokeLinecap="round" />

        {/* Traveling glow */}
        <circle ref={dotRef} r="6" fill="#7cf0ff" filter="url(#glow)" />
        {/* Subtle halo */}
        <circle r="30" fill="url(#dotGrad)" />
      </svg>
    </div>
  );
}
