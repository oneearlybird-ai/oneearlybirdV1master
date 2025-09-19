"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  containerRef: React.RefObject<HTMLElement | null>;
  padding?: number; // px inset from container edges
  radius?: number;  // corner radius
};

export function HeroGlowLoop({ containerRef, padding = 16, radius = 14 }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const dashRef = useRef<SVGPathElement | null>(null);
  const dotRef = useRef<SVGCircleElement | null>(null);
  const totalLenRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const [box, setBox] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  const roundedRectPath = (w: number, h: number, r: number) => {
    const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
    const x0 = padding, y0 = padding;
    const x1 = Math.max(0, w - padding), y1 = Math.max(0, h - padding);
    const xr = Math.max(0, x1 - rr), yr = Math.max(0, y1 - rr);
    const xl = Math.max(0, x0 + rr), yt = Math.max(0, y0 + rr);
    return `M ${xl} ${y0} H ${xr} A ${rr} ${rr} 0 0 1 ${x1} ${yt} V ${yr} A ${rr} ${rr} 0 0 1 ${xr} ${y1} H ${xl} A ${rr} ${rr} 0 0 1 ${x0} ${yr} V ${yt} A ${rr} ${rr} 0 0 1 ${xl} ${y0} Z`;
  }

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setBox({ w: Math.ceil(rect.width), h: Math.ceil(rect.height) });
    });
    ro.observe(el);
    // initial measure
    const rect = el.getBoundingClientRect();
    setBox({ w: Math.ceil(rect.width), h: Math.ceil(rect.height) });
    return () => ro.disconnect();
  }, [containerRef]);

  useEffect(() => {
    const svg = svgRef.current;
    const path = pathRef.current;
    const dash = dashRef.current;
    if (!svg || !path || !dash) return;
    // Update viewBox and path
    svg.setAttribute("viewBox", `0 0 ${box.w} ${box.h}`);
    const d = roundedRectPath(box.w, box.h, radius);
    path.setAttribute("d", d);
    dash.setAttribute("d", d);
    // Compute total length for dash animation
    totalLenRef.current = dash.getTotalLength();
    // One bright dash segment
    const seg = Math.max(100, Math.min(320, Math.round(totalLenRef.current * 0.22)));
    dash.setAttribute("stroke-dasharray", `${seg} ${totalLenRef.current}`);
  }, [box.w, box.h, radius]);

  useEffect(() => {
    let start = performance.now();
    function tick(now: number) {
      const dash = dashRef.current;
      const circle = dotRef.current;
      const path = dashRef.current;
      if (dash && path && circle && totalLenRef.current > 0) {
        const t = (now - start) / 1000; // seconds
        const speed = 0.18; // loops/sec (faster for visibility)
        const prog = (t * speed) % 1;
        const off = Math.round(totalLenRef.current * (1 - prog));
        dash.setAttribute("stroke-dashoffset", String(off));
        // moving hue 200..320 degrees
        const hue = 200 + ((t * 40) % 120);
        const color = `hsl(${hue.toFixed(0)}, 85%, 65%)`;
        dash.setAttribute("stroke", color);
        circle.setAttribute("fill", color);
        // place dot at segment head
        const len = totalLenRef.current * prog;
        const pt = path.getPointAtLength(len);
        circle.setAttribute("cx", `${pt.x}`);
        circle.setAttribute("cy", `${pt.y}`);
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg ref={svgRef} width="100%" height="100%" aria-hidden>
        <defs>
          <filter id="haloGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path ref={pathRef} fill="none" stroke="transparent" />
        <path
          ref={dashRef}
          fill="none"
          stroke="#00e6ff"
          strokeWidth="5"
          strokeLinecap="round"
          filter="url(#haloGlow)"
        />
        <circle ref={dotRef} r="6" />
      </svg>
    </div>
  );
}
