import type { ReactNode } from "react";
import StellarHeader from "@/components/stellar/Header";
import StellarFooter from "@/components/stellar/Footer";
import "./stellar.css";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-[#05050b] text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.35),_transparent_55%)] opacity-80" />
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <StellarHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <StellarFooter />
    </div>
  );
}
