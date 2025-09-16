"use client";

import { useEffect } from "react";

export default function RevealOnScroll() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".eb-reveal"));
    if (els.length === 0) return;

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("eb-in");
          io.unobserve(e.target);
        }
      }
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}

