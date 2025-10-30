"use client";

import { useCallback, useState } from "react";

type CopyOrgIdButtonProps = {
  value?: string | null;
  label?: string;
};

export default function CopyOrgIdButton({ value, label = "Copy support ID" }: CopyOrgIdButtonProps) {
  const [status, setStatus] = useState<"" | "copied" | "error">("");
  const supportId = typeof value === "string" ? value.trim() : "";
  const disabled = supportId.length === 0;

  const handleCopy = useCallback(async () => {
    if (!supportId) return;
    try {
      await navigator.clipboard.writeText(supportId);
      setStatus("copied");
      window.setTimeout(() => setStatus(""), 1500);
    } catch (err) {
      console.error("copy_support_id_failed", err);
      setStatus("error");
      window.setTimeout(() => setStatus(""), 1500);
    }
  }, [supportId]);

  const text = status === "copied" ? "Copied" : status === "error" ? "Copy failed" : label;

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={disabled}
      className={`btn btn-outline ${disabled ? "cursor-not-allowed text-white/40" : ""}`}
      aria-label={label}
    >
      {text}
    </button>
  );
}
