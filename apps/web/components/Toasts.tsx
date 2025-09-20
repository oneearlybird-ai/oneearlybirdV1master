"use client";

import React from "react";

type Toast = { id: number; message: string; kind?: 'default'|'success'|'error' };

export default function Toasts() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  React.useEffect(() => {
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent).detail as { message: string; kind?: Toast['kind'] };
      const id = Date.now() + Math.floor(Math.random()*1000);
      setToasts((t) => [...t, { id, message: detail?.message ?? '', kind: detail?.kind }]);
      setTimeout(() => setToasts((t) => t.filter(x => x.id !== id)), 1800);
    };
    window.addEventListener('eb_toast' as any, onToast);
    return () => window.removeEventListener('eb_toast' as any, onToast);
  }, []);
  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.kind || 'default'}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

export function toast(message: string, kind?: Toast['kind']) {
  try {
    window.dispatchEvent(new CustomEvent('eb_toast' as any, { detail: { message, kind } }));
  } catch { /* noop */ }
}

