"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Item = { q: string; a: string };

export default function TestimonialsCarousel({ items, interval = 5000 }: { items: Item[]; interval?: number }) {
  const [index, setIndex] = useState(0);
  const hover = useRef(false);
  const timer = useRef<number | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!items || items.length <= 1) return;
    timer.current = window.setInterval(() => {
      if (!hover.current) setIndex((i) => (i + 1) % items.length);
    }, Math.max(2500, interval));
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [items, interval]);

  useEffect(() => {
    setReady(true);
  }, []);

  const go = (dir: number) => setIndex((i) => (i + dir + items.length) % items.length);
  const trackStyle = useMemo(() => {
    if (!ready) {
      return { transform: `translateX(-${index * 100}%)` };
    }
    return { transform: `translateX(-${index * 100}%)`, transition: "transform 550ms cubic-bezier(0.32, 0.72, 0, 1)" };
  }, [index, ready]);

  return (
    <div
      className="relative"
      role="region"
      aria-label="Testimonials"
      aria-roledescription="carousel"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      }}
      tabIndex={0}
      onMouseEnter={() => { hover.current = true; }}
      onMouseLeave={() => { hover.current = false; }}
    >
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div
          className="flex"
          style={trackStyle}
          aria-live="polite"
        >
          {items.map((t, i) => (
            <figure
              key={t.q}
              aria-hidden={i !== index}
              className="min-w-full shrink-0 p-6"
            >
              <blockquote className="text-white/90 leading-relaxed md:leading-7">{t.q}</blockquote>
              <figcaption className="mt-3 text-sm text-white/70 leading-6">{t.a}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* Controls */}
      {items.length > 1 ? (
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 w-4 rounded-full transition-colors ${i === index ? 'bg-white/80' : 'bg-white/30 hover:bg-white/50'}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => go(-1)} className="rounded-lg border border-white/15 px-2 py-1 text-sm text-white/80 hover:text-white">Prev</button>
            <button onClick={() => go(1)} className="rounded-lg border border-white/15 px-2 py-1 text-sm text-white/80 hover:text-white">Next</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
