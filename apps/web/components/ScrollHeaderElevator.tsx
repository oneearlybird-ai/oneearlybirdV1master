"use client";

import { useEffect } from "react";

export default function ScrollHeaderElevator() {
  useEffect(() => {
    const el = document.getElementById('eb-header');
    if (!el) return;
    const onScroll = () => {
      if (window.scrollY > 8) el.classList.add('elevated');
      else el.classList.remove('elevated');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return null;
}

