"use client";

import "@/components/plasmic.registry"; // registers our code components for Plasmic Studio
import { PlasmicCanvasHost } from "@plasmicapp/host";

// Plasmic Studio loads this page in an iframe to discover/register components
// and enable visual editing. Our CSP normally blocks framing; see middleware
// for a path-specific exception for /plasmic-host.
export default function PlasmicHostPage() {
  return <PlasmicCanvasHost />;
}
