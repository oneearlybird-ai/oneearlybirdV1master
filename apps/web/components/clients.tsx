import Image from 'next/image'
import Particles from './particles'

import GoogleWorkspace from '@/public/logos/google-workspace.svg'
import GoogleCalendar from '@/public/logos/google-calendar.svg'
import Microsoft365 from '@/public/logos/microsoft-365.svg'
import Outlook from '@/public/logos/outlook.svg'
import Salesforce from '@/public/logos/salesforce.svg'
import Hubspot from '@/public/logos/hubspot.svg'
import Zoho from '@/public/logos/zoho.svg'
import Stripe from '@/public/logos/stripe.svg'
import Slack from '@/public/logos/slack.svg'

const logos = [
  { src: GoogleWorkspace, alt: 'Google Workspace' },
  { src: GoogleCalendar, alt: 'Google Calendar' },
  { src: Microsoft365, alt: 'Microsoft 365' },
  { src: Outlook, alt: 'Outlook' },
  { src: Salesforce, alt: 'Salesforce' },
  { src: Hubspot, alt: 'HubSpot' },
  { src: Zoho, alt: 'Zoho' },
  { src: Stripe, alt: 'Stripe' },
  { src: Slack, alt: 'Slack' },
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
                {logos.map((logo, index) => (
                  <li key={index}>
                    <Image src={logo.src} alt={logo.alt} />
                  </li>
                ))}
              </ul>
              <ul
                className="flex animate-infinite-scroll items-center justify-center md:justify-start [&_img]:max-w-none [&_li]:mx-8"
                aria-hidden="true"
              >
                {logos.map((logo, index) => (
                  <li key={index}>
                    <Image src={logo.src} alt={logo.alt} />
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