"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import MobileBottomNav from "@/components/mobile/BottomNav";
import Toasts from "@/components/Toasts";

export default function MobileLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    const header = document.getElementById("eb-header");
    const footer = document.querySelector("footer");
    const storedStyles: Array<{ el: HTMLElement; display: string }> = [];
    if (header) {
      storedStyles.push({ el: header, display: header.style.display });
      header.style.display = "none";
    }
    if (footer instanceof HTMLElement) {
      storedStyles.push({ el: footer, display: footer.style.display });
      footer.style.display = "none";
    }
    document.body.classList.add("ob-mobile-shell");
    return () => {
      storedStyles.forEach(({ el, display }) => {
        el.style.display = display;
      });
      document.body.classList.remove("ob-mobile-shell");
    };
  }, []);

  return (
    <div className="relative flex min-h-[100svh] flex-col bg-neutral-950 text-white">
      <main className="flex-1 pb-[calc(env(safe-area-inset-bottom)+4.5rem)]">{children}</main>
      <MobileBottomNav />
      <Toasts />
    </div>
  );
}
