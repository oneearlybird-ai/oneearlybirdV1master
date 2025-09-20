"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

type Props = {
  children: ReactNode;
  speedSec?: number; // loop duration in seconds
  ariaLabel?: string;
};

// CSS-only marquee using duplicated tracks; pausable on hover; reduced motion aware via globals.css
export function Marquee({ children, speedSec = 16, ariaLabel }: Props) {
  const laneARef = useRef<HTMLDivElement | null>(null);
  const laneBRef = useRef<HTMLDivElement | null>(null);
  const laneWrapARef = useRef<HTMLDivElement | null>(null);
  const laneWrapBRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);
  const laneWRef = useRef(0);
  const gapRef = useRef(0);
  const xARef = useRef(0);
  const xBRef = useRef(0);
  const pausedRef = useRef(false);
  const reduceRef = useRef(false);
  const dprRef = useRef(1);

  function readGapPx(el: HTMLElement): number {
    const cs = getComputedStyle(el);
    const g = cs.columnGap || cs.gap || '0';
    const n = parseFloat(g);
    return Number.isFinite(n) ? n : 0;
  }

  function placeLanes() {
    const a = laneARef.current, b = laneBRef.current;
    if (!a || !b) return;
    laneWRef.current = a.offsetWidth;
    xARef.current = 0;
    xBRef.current = laneWRef.current;
    a.style.transform = `translate3d(${xARef.current}px,0,0)`;
    b.style.transform = `translate3d(${xBRef.current}px,0,0)`;
  }

  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduceRef.current = !!m.matches;
    dprRef.current = Math.max(1, Math.round(window.devicePixelRatio || 1));
    const onChange = () => { reduceRef.current = !!m.matches; if (reduceRef.current) stop(); else start(); };
    m.addEventListener?.('change', onChange);
    return () => m.removeEventListener?.('change', onChange);
  }, []);

  const [containerH, setContainerH] = useState<number | null>(null);

  useEffect(() => {
    // Measure lane width and computed gap; set spacer widths accordingly
    function measure() {
      const aWrap = laneWrapARef.current; if (!aWrap) return;
      gapRef.current = readGapPx(aWrap);
      // Update spacer widths
      const spacers = aWrap.querySelectorAll<HTMLElement>('[data-marquee-spacer]');
      spacers.forEach(s => { s.style.width = `${gapRef.current}px`; });
      const bWrap = laneWrapBRef.current;
      const gapRounded = Math.round(gapRef.current * dprRef.current) / dprRef.current;
      if (bWrap) bWrap.querySelectorAll<HTMLElement>('[data-marquee-spacer]').forEach(s => { s.style.width = `${gapRounded}px`; });
      spacers.forEach(s => { s.style.width = `${gapRounded}px`; });
      // Set container height to content height so absolute lanes are visible
      const h = aWrap.offsetHeight;
      if (h && h !== containerH) setContainerH(h);
      placeLanes();
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (laneARef.current) ro.observe(laneARef.current);
    window.addEventListener('resize', measure);
    start();
    return () => { stop(); window.removeEventListener('resize', measure); ro.disconnect(); };
  }, [speedSec]);

  function tick(ts: number) {
    if (pausedRef.current || reduceRef.current) { lastRef.current = ts; rafRef.current = requestAnimationFrame(tick); return; }
    const last = lastRef.current ?? ts; const dt = Math.min(64, ts - last); lastRef.current = ts;
    const w = laneWRef.current || 1;
    const pxPerMs = (w / (speedSec * 1000));
    xARef.current -= dt * pxPerMs;
    xBRef.current -= dt * pxPerMs;
    if (xARef.current <= -w) xARef.current = xBRef.current + w;
    if (xBRef.current <= -w) xBRef.current = xARef.current + w;
    // Quantize to device pixel to avoid subpixel seam rounding differences
    const q = dprRef.current;
    const qA = Math.round(xARef.current * q) / q;
    const qB = Math.round(xBRef.current * q) / q;
    const a = laneARef.current, b = laneBRef.current;
    if (a) a.style.transform = `translate3d(${qA}px,0,0)`;
    if (b) b.style.transform = `translate3d(${qB}px,0,0)`;
    rafRef.current = requestAnimationFrame(tick);
  }

  function start() { stop(); lastRef.current = null; rafRef.current = requestAnimationFrame(tick); }
  function stop() { if (rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current = null; }

  const laneClass = "absolute top-0 left-0 flex items-center gap-3 md:gap-5 min-w-max will-change-transform";

  return (
    <div className="eb-marquee" aria-label={ariaLabel} role="marquee" style={containerH ? { height: `${containerH}px` } : undefined} onMouseEnter={() => { pausedRef.current = true; }} onMouseLeave={() => { pausedRef.current = false; }}>
      {/* Lane A */}
      <div ref={laneARef} className={laneClass}>
        <div ref={laneWrapARef} className="flex items-center gap-3 md:gap-5 min-w-max">
          {children}
          <div data-marquee-spacer style={{ width: 0, height: 1 }} aria-hidden />
        </div>
      </div>
      {/* Lane B (identical) */}
      <div ref={laneBRef} className={laneClass} aria-hidden>
        <div ref={laneWrapBRef} className="flex items-center gap-3 md:gap-5 min-w-max">
          {children}
          <div data-marquee-spacer style={{ width: 0, height: 1 }} aria-hidden />
        </div>
      </div>
    </div>
  );
}
