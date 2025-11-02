import Image, { type StaticImageData } from 'next/image';

import googleCalendarLogo from '@/public/logos/integrations/google-calendar.svg';
import hubspotLogo from '@/public/logos/integrations/hubspot.svg';
import microsoft365Logo from '@/public/logos/integrations/microsoft-365.svg';
import salesforceLogo from '@/public/logos/integrations/salesforce.svg';
import serviceTitanLogo from '@/public/logos/integrations/servicetitan.svg';
import slackLogo from '@/public/logos/integrations/slack.svg';
import zapierLogo from '@/public/logos/integrations/zapier.svg';
import zohoLogo from '@/public/logos/integrations/zoho.svg';
import twilioLogo from '@/public/logos/twilio.svg';

import Particles from './particles';

type Logo = {
  label: string;
  className?: string;
  image?: StaticImageData;
};

const logos: Logo[] = [
  { label: 'Google Calendar', image: googleCalendarLogo },
  { label: 'Microsoft 365', image: microsoft365Logo },
  { label: 'Slack', image: slackLogo },
  { label: 'HubSpot', image: hubspotLogo },
  { label: 'Salesforce', image: salesforceLogo },
  { label: 'Zoho', image: zohoLogo },
  { label: 'Zapier', image: zapierLogo },
  { label: 'Twilio', image: twilioLogo },
  { label: 'ServiceTitan', image: serviceTitanLogo },
];

export default function Clients() {
  return (
    <section>
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="absolute inset-0 mx-auto max-w-6xl px-4 sm:px-6">
          <Particles className="absolute inset-0 -z-10" quantity={5} />
        </div>

        <div className="py-12 md:py-16">
          <div className="overflow-hidden">
            <div className="inline-flex w-full flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
              <ul className="flex animate-infinite-scroll items-center justify-center md:justify-start [&_li]:mx-8">
                {logos.map((logo) => (
                  <li key={logo.label}>
                    {logo.image ? (
                      <Image
                        src={logo.image}
                        alt={logo.label}
                        width={120}
                        height={28}
                        className="h-6 w-auto object-contain sm:h-7"
                      />
                    ) : (
                      <span className={`text-lg text-slate-300/90 sm:text-xl ${logo.className ?? ''}`}>
                        {logo.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <ul
                className="flex animate-infinite-scroll items-center justify-center md:justify-start [&_li]:mx-8"
                aria-hidden="true"
              >
                {logos.map((logo) => (
                  <li key={`dup-${logo.label}`}>
                    {logo.image ? (
                      <Image
                        src={logo.image}
                        alt={logo.label}
                        width={120}
                        height={28}
                        className="h-6 w-auto object-contain sm:h-7"
                      />
                    ) : (
                      <span className={`text-lg text-slate-300/90 sm:text-xl ${logo.className ?? ''}`}>
                        {logo.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
