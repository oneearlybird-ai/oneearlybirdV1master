"use client";

import { useState } from "react";

export default function CopyDiagnostics() {
  const [status, setStatus] = useState<"" | "copied" | "error">("");
  async function onCopy() {
    try {
      const ua = navigator.userAgent;
      const lang = navigator.language;
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth, h = window.innerHeight;
      const ts = new Date().toISOString();
      const href = window.location.href;
      const text = `EarlyBird Diagnostics\nTime: ${ts}\nURL: ${href}\nUA: ${ua}\nLang: ${lang}\nDPR: ${dpr}\nViewport: ${w}x${h}`;
      await navigator.clipboard.writeText(text);
      setStatus("copied");
      setTimeout(() => setStatus(""), 1500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus(""), 1500);
    }
  }
  return (
    <button onClick={onCopy} className="btn btn-outline" aria-label="Copy diagnostics">
      {status === "copied" ? "Copied" : "Copy diagnostics"}
    </button>
  );
}

