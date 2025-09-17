"use client";

import { ReactNode, useEffect, useRef } from "react";

type Props = {
  children: ReactNode;
  speedSec?: number; // loop duration in seconds
  ariaLabel?: string;
};

// CSS-only marquee using duplicated tracks; pausable on hover; reduced motion aware via globals.css
export function Marquee({ children, speedSec = 16, ariaLabel }: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const groupRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const widthRef = useRef(0);
  const lastRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const reduceRef = useRef(false);

  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduceRef.current = !!m.matches;
    const onChange = () => { reduceRef.current = !!m.matches; if (reduceRef.current) cancel(); else start(); };
    m.addEventListener?.('change', onChange);
    return () => m.removeEventListener?.('change', onChange);
  }, []);

  useEffect(() => {
    function measure() {
      const g = groupRef.current; if (!g) return; widthRef.current = g.offsetWidth;
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (groupRef.current) ro.observe(groupRef.current);
    window.addEventListener('resize', measure);
    start();
    return () => { cancel(); window.removeEventListener('resize', measure); ro.disconnect(); };
  }, [speedSec]);

  function step(ts: number) {
    if (reduceRef.current || pausedRef.current) { lastRef.current = ts; rafRef.current = requestAnimationFrame(step); return; }
    const last = lastRef.current ?? ts; const dt = Math.min(64, ts - last); lastRef.current = ts;
    const w = widthRef.current || 1; // px; avoid 0
    const pxPerMs = (w / (speedSec * 1000));
    offsetRef.current -= dt * pxPerMs;
    if (offsetRef.current <= -w) offsetRef.current += w;
    const t = trackRef.current; if (t) t.style.transform = `translate3d(${offsetRef.current}px,0,0)`;
    rafRef.current = requestAnimationFrame(step);
  }
  function start() { cancel(); lastRef.current = null; rafRef.current = requestAnimationFrame(step); }
  function cancel() { if (rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current = null; }

  return (
    <div className="eb-marquee" aria-label={ariaLabel} role="marquee" onMouseEnter={() => { pausedRef.current = true; }} onMouseLeave={() => { pausedRef.current = false; }}>
      <div className="eb-marquee-track" ref={trackRef} style={{ animation: 'none' }}>
        <div ref={groupRef} className="flex items-center gap-3 md:gap-5 min-w-max">{children}</div>
        <div className="flex items-center gap-3 md:gap-5 min-w-max" aria-hidden>{children}</div>
        <div className="flex items-center gap-3 md:gap-5 min-w-max" aria-hidden>{children}</div>
      </div>
    </div>
  );
}
