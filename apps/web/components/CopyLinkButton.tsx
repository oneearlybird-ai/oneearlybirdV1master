"use client";

import { useState } from "react";

export default function CopyLinkButton({ anchorId, label = "Copy link" }: { anchorId: string; label?: string }) {
  const [status, setStatus] = useState<"" | "copied" | "error">("");
  async function doCopy() {
    try {
      const { origin, pathname } = window.location;
      const href = `${origin}${pathname}#${anchorId}`;
      await navigator.clipboard.writeText(href);
      setStatus("copied");
      setTimeout(() => setStatus(""), 1500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus(""), 1500);
    }
  }
  return (
    <button
      onClick={doCopy}
      className="ml-3 rounded border border-white/20 px-2 py-1 text-xs text-white/80 hover:text-white"
      aria-label={label}
    >
      {status === "copied" ? "Copied" : label}
    </button>
  );
}

