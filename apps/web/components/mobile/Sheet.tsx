"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
};

export default function Sheet({ open, onClose, title, children, dismissible = true }: SheetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return undefined;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (!dismissible) return;
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dismissible, onClose, open]);

  if (typeof document === "undefined" || !open) return null;

  if (!containerRef.current) {
    const el = document.createElement("div");
    el.className = "eb-mobile-sheet-portal";
    containerRef.current = el;
  }

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    if (!document.body.contains(el)) {
      document.body.appendChild(el);
    }
    return () => {
      if (el.parentElement) {
        el.parentElement.removeChild(el);
      }
    };
  }, []);

  const node = (
    <div className="fixed inset-0 z-[1000] flex">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={() => dismissible && onClose()}
        aria-label="Close dialog"
      />
      <div
        className="relative ml-auto flex h-full w-full max-w-lg flex-col rounded-t-3xl bg-neutral-950 p-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] text-white shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          {dismissible ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : null}
        </div>
        <div className="mt-4 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );

  return createPortal(node, containerRef.current);
}
