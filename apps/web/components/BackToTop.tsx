"use client";

import { useEffect, useState } from "react";

export default function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const threshold = Math.max(300, Math.floor(window.innerHeight * 0.5));
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable < 400) { setShow(false); return; }
      setShow(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTop = () => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      window.scrollTo(0, 0);
    }
  };

  if (!show) return null;
  return (
    <button
      onClick={scrollTop}
      aria-label="Back to top"
      className="fixed right-4 bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] z-50 rounded-full bg-white px-4 py-2 text-sm text-black shadow-lg shadow-black/30 transition-colors hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:bottom-6 sm:right-6"
      type="button"
    >
      ^ Top
    </button>
  );
}
