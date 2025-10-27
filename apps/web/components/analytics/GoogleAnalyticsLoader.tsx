'use client';

import { useEffect } from "react";

const MEASUREMENT_ID = "G-7JKBFQ2RHZ";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export default function GoogleAnalyticsLoader() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.dataLayer = window.dataLayer || [];

    if (!window.gtag) {
      window.gtag = (...args: unknown[]) => {
        window.dataLayer?.push(args);
      };
    }

    const scriptSrc = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${scriptSrc}"]`);

    if (!existingScript) {
      const loader = document.createElement("script");
      loader.src = scriptSrc;
      loader.async = true;
      document.head.appendChild(loader);
    }

    window.gtag("js", new Date());
    window.gtag("config", MEASUREMENT_ID);
  }, []);

  return null;
}
