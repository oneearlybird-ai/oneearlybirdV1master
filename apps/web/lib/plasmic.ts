import { initPlasmicLoader } from "@plasmicapp/loader-nextjs";

const projectId = process.env.PLASMIC_PROJECT_ID;
const publicToken = process.env.PLASMIC_PUBLIC_TOKEN;

// If env vars are missing, export a null loader to avoid build-time crashes.
// Pages can guard and return 404 / hint until Plasmic is configured.
export const PLASMIC = (projectId && publicToken)
  ? initPlasmicLoader({
      projects: [{ id: projectId, token: publicToken }],
      preview: process.env.NODE_ENV !== "production",
    })
  : null as unknown as ReturnType<typeof initPlasmicLoader>;
