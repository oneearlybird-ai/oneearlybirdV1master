import Image from 'next/image';
import Particles from './particles';

type LogoEntry = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

const logos: LogoEntry[] = [
  { src: '/logos/integrations/google-calendar.svg', alt: 'Google Calendar', width: 160, height: 160 },
  { src: '/logos/integrations/microsoft-365.svg', alt: 'Microsoft 365', width: 220, height: 60 },
  { src: '/logos/integrations/slack.svg', alt: 'Slack', width: 220, height: 60 },
  { src: '/logos/integrations/hubspot.svg', alt: 'HubSpot', width: 220, height: 70 },
  { src: '/logos/integrations/salesforce.svg', alt: 'Salesforce', width: 240, height: 140 },
  { src: '/logos/integrations/zoho.svg', alt: 'Zoho', width: 220, height: 70 },
  { src: '/logos/integrations/zapier.svg', alt: 'Zapier', width: 220, height: 70 },
  { src: '/logos/integrations/pagerduty.svg', alt: 'PagerDuty', width: 220, height: 60 },
  { src: '/logos/integrations/servicetitan.png', alt: 'ServiceTitan', width: 240, height: 80 },
];

export default function Clients() {
  return (
    <section>
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">

        {/* Particles animation */}
        <div className="absolute inset-0 max-w-6xl mx-auto px-4 sm:px-6">
          <Particles className="absolute inset-0 -z-10" quantity={5} />
        </div>

        <div className="py-12 md:py-16">
          <div className="overflow-hidden">
            <div className="inline-flex w-full flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
              <ul className="flex animate-infinite-scroll items-center justify-center md:justify-start [&_img]:max-w-none [&_li]:mx-8">
                {logos.map((logo) => (
                  <li key={logo.alt}>
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={logo.width}
                      height={logo.height}
                      className="h-10 w-auto object-contain sm:h-12"
                      sizes="(max-width: 640px) 120px, 180px"
                    />
                  </li>
                ))}
              </ul>
              <ul
                className="flex animate-infinite-scroll items-center justify-center md:justify-start [&_img]:max-w-none [&_li]:mx-8"
                aria-hidden="true"
              >
                {logos.map((logo) => (
                  <li key={`dup-${logo.alt}`}>
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={logo.width}
                      height={logo.height}
                      className="h-10 w-auto object-contain sm:h-12"
                      sizes="(max-width: 640px) 120px, 180px"
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
