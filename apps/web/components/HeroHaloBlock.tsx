"use client";

import { ReactNode, useRef } from "react";
import { HeroGlowLoop } from "@/components/HeroGlowLoop";

export function HeroHaloBlock({ children }: { children: ReactNode }) {
  const blockRef = useRef<HTMLDivElement | null>(null);
  return (
    <div ref={blockRef} className="relative">
      {children}
      <HeroGlowLoop containerRef={blockRef} padding={16} radius={14} />
    </div>
  );
}

