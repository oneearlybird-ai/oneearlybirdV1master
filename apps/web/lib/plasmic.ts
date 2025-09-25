import { initPlasmicLoader } from "@plasmicapp/loader-nextjs";

// Plasmic loader singleton
export const PLASMIC = initPlasmicLoader({
  projects: [
    {
      id: process.env.PLASMIC_PROJECT_ID || "",
      token: process.env.PLASMIC_PUBLIC_TOKEN || "",
    },
  ],
  // Enable design-time previews when not in production.
  // You can also toggle with a cookie via Plasmic Studio.
  preview: process.env.NODE_ENV !== "production",
});

