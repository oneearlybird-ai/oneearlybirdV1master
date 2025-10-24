import Link from "next/link";
import Image from "next/image";

import Star from "@/public/images/star.svg";
import { calendarIntegrations, crmIntegrations, type CRMIntegration } from "@/lib/crmIntegrations";

export default function IntegrationsList() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pb-12 md:pb-20">
          <div className="flex flex-col gap-6 py-6 border-b [border-image:linear-gradient(to_right,transparent,var(--color-slate-800),transparent)1] md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25rem] text-slate-400">Platform integrations</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Sync EarlyBird with the CRMs and calendars crews use daily</h2>
            </div>
            <p className="text-sm text-slate-400 md:max-w-md">
              Built-in connectors keep transcripts, bookings, and follow-ups exactly where your revenue, dispatch, and ops teams expect them.
            </p>
          </div>

          <div className="mt-12 md:mt-16 space-y-12 md:space-y-16">
            <div>
              <h3 id="crms" className="scroll-mt-8 text-2xl font-bold inline-flex bg-clip-text text-transparent bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 pb-8">
                CRM integrations
              </h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {crmIntegrations.map((item, index) => (
                  <IntegrationCard key={item.slug} item={item} index={index} />
                ))}
              </div>
            </div>

            <div>
              <h3 id="calendars" className="scroll-mt-8 text-2xl font-bold inline-flex bg-clip-text text-transparent bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 pb-8">
                Calendar & scheduling
              </h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {calendarIntegrations.map((item, index) => (
                  <IntegrationCard key={item.slug} item={item} index={index} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type CardProps = {
  item: CRMIntegration;
  index: number;
};

function IntegrationCard({ item, index }: CardProps) {
  return (
    <div key={index} className="group relative rounded-3xl border border-slate-800 bg-linear-to-tr from-slate-800 to-slate-800/25 transition-colors hover:border-slate-700/60">
      <div className="flex h-full flex-col p-5">
        <div className="mb-3 flex items-center space-x-3">
          <div className="relative">
            <Image src={item.logo} width={40} height={40} alt={item.name} />
            <Image className="absolute -right-1 top-0" src={Star} width={16} height={16} alt="Star" aria-hidden="true" />
          </div>
          <Link className="font-semibold bg-clip-text text-transparent bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 group-hover:before:absolute group-hover:before:inset-0" href={`/integrations/${item.slug}`}>
            {item.name}
          </Link>
        </div>
        <div className="grow">
          <p className="text-sm text-slate-400">{item.cardDescription}</p>
        </div>
      </div>
    </div>
  );
}
