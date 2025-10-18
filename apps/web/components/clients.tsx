import Image from 'next/image'
import Particles from './particles'

import GoogleCalendarLogo from '@/public/logos/google-calendar.svg'
import Microsoft365Logo from '@/public/logos/microsoft-365.svg'
import SlackLogo from '@/public/logos/slack.svg'
import HubSpotLogo from '@/public/logos/hubspot.svg'
import SalesforceLogo from '@/public/logos/salesforce.svg'
import ZohoLogo from '@/public/logos/zoho.svg'
import ZapierLogo from '@/public/logos/zapier.svg'
import TwilioLogo from '@/public/logos/twilio.svg'
import SignalWireLogo from '@/public/logos/signalwire.svg'

const logos = [
  { src: GoogleCalendarLogo, alt: 'Google Calendar' },
  { src: Microsoft365Logo, alt: 'Microsoft 365' },
  { src: SlackLogo, alt: 'Slack' },
  { src: HubSpotLogo, alt: 'HubSpot' },
  { src: SalesforceLogo, alt: 'Salesforce' },
  { src: ZohoLogo, alt: 'Zoho' },
  { src: ZapierLogo, alt: 'Zapier' },
  { src: TwilioLogo, alt: 'Twilio' },
  { src: SignalWireLogo, alt: 'SignalWire' },
]

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
