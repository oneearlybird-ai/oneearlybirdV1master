export const LOGO_ASSETS: Record<string, string> = {
  aws: "/logos/aws.svg",
  "google-calendar": "/logos/google-calendar.svg",
  "google-workspace": "/logos/google-workspace.svg",
  hubspot: "/logos/hubspot.svg",
  "microsoft-365": "/logos/microsoft-365.svg",
  outlook: "/logos/outlook.svg",
  salesforce: "/logos/salesforce.svg",
  signalwire: "/logos/signalwire.svg",
  slack: "/logos/slack.svg",
  stripe: "/logos/stripe.svg",
  twilio: "/logos/twilio.svg",
  zapier: "/logos/zapier.svg",
  zoho: "/logos/zoho.svg",
};

export function resolveLogoSrc(id: string): string | null {
  return LOGO_ASSETS[id] ?? null;
}
