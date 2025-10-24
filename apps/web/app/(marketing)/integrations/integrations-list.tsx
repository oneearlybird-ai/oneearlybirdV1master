import Link from "next/link";
import Image from "next/image";
import Star from "@/public/images/star.svg";
import { calendarIntegrations, crmIntegrations, type CRMIntegration } from "@/lib/crmIntegrations";

export default function IntegrationsList() {
  const crmItems = crmIntegrations;
  const calendarItems = calendarIntegrations;

  return (
    <section>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        <div className="pb-12 md:pb-20">
          <div className="flex flex-col gap-6 py-6 border-b [border-image:linear-gradient(to_right,transparent,var(--color-slate-800),transparent)1] md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25rem] text-slate-400">Platform integrations</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Connect EarlyBird to the systems your team already lives in</h2>
            </div>
            <p className="text-sm text-slate-400 md:max-w-md">
              We maintain native syncs with the CRMs and scheduling stacks that keep revenue teams, dispatch, and operations aligned. No middleware, no nightly imports—just transcripts, bookings, and follow-ups where they belong.
            </p>
          </div>

          {/* Cards */}
          <div className="space-y-12 md:space-y-16">
            <div className="mt-12 md:mt-16">
              <h3 id="crms" className="scroll-mt-8 text-2xl font-bold inline-flex bg-clip-text text-transparent bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 pb-8">CRM integrations</h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {crmItems.map((item, index) => (
                  <IntegrationCard key={item.slug} item={item} index={index} />
                ))}
              </div>
            </div>

            <div>
              <h3 id="calendars" className="scroll-mt-8 text-2xl font-bold inline-flex bg-clip-text text-transparent bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 pb-8">Calendar & scheduling</h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {calendarItems.map((item, index) => (
                  <IntegrationCard key={item.slug} item={item} index={index} />
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

type CardProps = {
  item: CRMIntegration;
  index: number;
};

export function IntegrationCard({ item, index }: CardProps) {
  return (
    <div key={index} className="bg-linear-to-tr from-slate-800 to-slate-800/25 rounded-3xl border border-slate-800 hover:border-slate-700/60 transition-colors group relative">
      <div className="flex flex-col p-5 h-full">
        <div className="flex items-center space-x-3 mb-3">
          <div className="relative">
            <Image src={item.logo} width={40} height={40} alt={item.name} />
            <Image className="absolute top-0 -right-1" src={Star} width={16} height={16} alt="Star" aria-hidden="true" />
          </div>
          <Link className="font-semibold bg-clip-text text-transparent bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 group-hover:before:absolute group-hover:before:inset-0" href={`/integrations/${item.slug}`}>
            {item.name}
          </Link>
        </div>
        <div className="grow">
          <div className="text-sm text-slate-400">{item.cardDescription}</div>
        </div>
      </div>
    </div>
  )
}
