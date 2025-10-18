import Particles from './particles';

const logos: Array<{ label: string; className?: string }> = [
  { label: 'Google Calendar', className: 'font-semibold tracking-tight' },
  { label: 'Microsoft 365', className: 'font-semibold tracking-tight' },
  { label: 'Slack', className: 'font-bold lowercase tracking-tight' },
  { label: 'HubSpot', className: 'font-semibold tracking-tight' },
  { label: 'Salesforce', className: 'font-semibold tracking-tight' },
  { label: 'Zoho', className: 'font-black uppercase tracking-widest' },
  { label: 'Zapier', className: 'font-semibold tracking-wide lowercase' },
  { label: 'Twilio', className: 'font-semibold tracking-wide lowercase' },
  { label: 'ServiceTitan', className: 'font-semibold tracking-tight' },
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
                    <span className={`text-lg text-slate-300/90 sm:text-xl ${logo.className ?? ''}`}>
                      {logo.label}
                    </span>
                  </li>
                ))}
              </ul>
              <ul
                className="flex animate-infinite-scroll items-center justify-center md:justify-start [&_li]:mx-8"
                aria-hidden="true"
              >
                {logos.map((logo) => (
                  <li key={`dup-${logo.label}`}>
                    <span className={`text-lg text-slate-300/90 sm:text-xl ${logo.className ?? ''}`}>
                      {logo.label}
                    </span>
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
