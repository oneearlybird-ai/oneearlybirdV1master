"use client";

import { registerComponent } from "@plasmicapp/host";
import { Marquee } from "@/components/Marquee";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import React from "react";

// Lightweight building blocks that match the site visual language
export function EbSection({ id, title, children }: { id?: string; title?: string; children?: React.ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      {title ? <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">{title}</h2> : null}
      {children}
    </section>
  );
}

export function EbCard({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 p-6 eb-surface ${className}`}>{children}</div>
  );
}

export function EbButton({ href = "#", variant = "primary", children }: { href?: string; variant?: "primary" | "outline"; children?: React.ReactNode }) {
  const cls = variant === "primary" ? "btn btn-primary" : "btn btn-outline";
  return (
    <a href={href} className={cls}>
      {children}
    </a>
  );
}

export function ProviderLogo({ id, label }: { id: string; label?: string }) {
  return (
    <figure className="logo-badge h-10 w-32 overflow-hidden rounded-lg border border-white/10 bg-white px-3 py-1.5 flex items-center justify-center">
      <img src={`/logos/${id}.svg`} alt={label || id} className="block max-h-6 max-w-full object-contain" loading="lazy" decoding="async" />
      <figcaption className="sr-only">{label || id}</figcaption>
    </figure>
  );
}

// Register components for Plasmic Studio
registerComponent(EbSection, {
  name: "EbSection",
  importPath: "@/components/plasmic.registry",
  importName: "EbSection",
  props: {
    id: { type: "string", displayName: "Anchor id" },
    title: { type: "string" },
    children: { type: "slot" },
  },
});

registerComponent(EbCard, {
  name: "EbCard",
  importPath: "@/components/plasmic.registry",
  importName: "EbCard",
  props: {
    className: { type: "string" },
    children: { type: "slot" },
  },
});

registerComponent(EbButton, {
  name: "EbButton",
  importPath: "@/components/plasmic.registry",
  importName: "EbButton",
  props: {
    href: { type: "string" },
    variant: { type: "choice", options: ["primary", "outline"], defaultValue: "primary" },
    children: { type: "slot" },
  },
});

registerComponent(ProviderLogo, {
  name: "ProviderLogo",
  importPath: "@/components/plasmic.registry",
  importName: "ProviderLogo",
  props: {
    id: { type: "string", defaultValue: "google-calendar" },
    label: { type: "string" },
  },
});

registerComponent(Marquee as any, {
  name: "Marquee",
  importPath: "@/components/Marquee",
  importName: "Marquee",
  props: {
    speedSec: { type: "number", defaultValue: 16 },
    ariaLabel: { type: "string", defaultValue: "Integrations logos" },
    children: { type: "slot" },
  },
});

registerComponent(TestimonialsCarousel as any, {
  name: "TestimonialsCarousel",
  importPath: "@/components/TestimonialsCarousel",
  importName: "default",
  props: {
    interval: { type: "number", defaultValue: 5000 },
    items: {
      type: "array",
      displayName: "Items",
      defaultValue: [
        { q: "“EarlyBird saves us hours daily.”", a: "Alex R." },
        { q: "“Set up in minutes; calls answered 24/7.”", a: "Mia L." },
      ],
      itemType: {
        type: "object",
        fields: {
          q: { type: "string", displayName: "Quote" },
          a: { type: "string", displayName: "Attribution" },
        },
      },
    },
  },
});
