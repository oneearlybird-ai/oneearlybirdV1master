"use client";

import { useState } from "react";

export default function CopyPageLinkButton({ label = "Copy page link" }: { label?: string }) {
  const [status, setStatus] = useState<"" | "copied" | "error">("");
  async function onCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus("copied");
      setTimeout(() => setStatus(""), 1500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus(""), 1500);
    }
  }
  return (
    <button onClick={onCopy} className="btn btn-outline" aria-label={label} title={label}>
      {status === "copied" ? "Copied" : label}
    </button>
  );
}

