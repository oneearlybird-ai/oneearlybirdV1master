import awsLogo from "@/public/logos/aws.svg?url";
import googleCalendarLogo from "@/public/logos/google-calendar.svg?url";
import googleWorkspaceLogo from "@/public/logos/google-workspace.svg?url";
import hubspotLogo from "@/public/logos/hubspot.svg?url";
import microsoft365Logo from "@/public/logos/microsoft-365.svg?url";
import outlookLogo from "@/public/logos/outlook.svg?url";
import salesforceLogo from "@/public/logos/salesforce.svg?url";
import signalwireLogo from "@/public/logos/signalwire.svg?url";
import slackLogo from "@/public/logos/slack.svg?url";
import stripeLogo from "@/public/logos/stripe.svg?url";
import twilioLogo from "@/public/logos/twilio.svg?url";
import zapierLogo from "@/public/logos/zapier.svg?url";
import zohoLogo from "@/public/logos/zoho.svg?url";

export const LOGO_ASSETS: Record<string, string> = {
  aws: awsLogo,
  "google-calendar": googleCalendarLogo,
  "google-workspace": googleWorkspaceLogo,
  hubspot: hubspotLogo,
  "microsoft-365": microsoft365Logo,
  outlook: outlookLogo,
  salesforce: salesforceLogo,
  signalwire: signalwireLogo,
  slack: slackLogo,
  stripe: stripeLogo,
  twilio: twilioLogo,
  zapier: zapierLogo,
  zoho: zohoLogo,
};

export function resolveLogoSrc(id: string): string | null {
  return LOGO_ASSETS[id] ?? null;
}
