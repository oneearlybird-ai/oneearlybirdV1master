"use client";

import { useEffect, useState } from "react";

const KEY = "eb_porting_banner_dismissed_v1";

export default function PortingBanner() {
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    try { setHidden(localStorage.getItem(KEY) === "1"); } catch { /* ignore */ }
  }, []);
  if (hidden) return null;
  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80 flex items-start justify-between gap-3">
      <div>
        Using an existing business number? We can port it for you. <a href="/support/porting" className="underline">Start porting</a>.
      </div>
      <button
        onClick={() => { try { localStorage.setItem(KEY, "1"); } catch { /* ignore */ } setHidden(true); }}
        className="rounded-lg border border-white/20 px-2 py-1 text-xs text-white/70 hover:text-white"
        aria-label="Dismiss"
      >
        Dismiss
      </button>
    </div>
  );
}
