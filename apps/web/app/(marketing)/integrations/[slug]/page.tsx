import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import Illustration from "@/public/images/page-illustration.svg";
import Illustration02 from "@/public/images/page-illustration-02.svg";
import IntegrationImg from "@/public/images/integration-image.png";
import Particles from "@/components/particles";
import { allIntegrations, crmIntegrationMap } from "@/lib/crmIntegrations";

type IntegrationParams = {
  slug: string;
};

export function generateStaticParams() {
  return allIntegrations.map((integration) => ({ slug: integration.slug }));
}

export function generateMetadata({ params }: { params: IntegrationParams }): Metadata {
  const integration = crmIntegrationMap.get(params.slug);

  if (!integration) {
    return {
      title: "Integration Not Found - EarlyBird AI",
    };
  }

  return {
    title: `${integration.name} Integration - EarlyBird AI`,
    description: integration.summary,
  };
}

export default function IntegrationPage({ params }: { params: IntegrationParams }) {
  const integration = crmIntegrationMap.get(params.slug);

  if (!integration) {
    notFound();
  }

  return (
    <section className="relative">
      {/* Illustration 02 */}
      <div className="pointer-events-none absolute left-1/2 -mb-16 -translate-x-1/2 blur-3xl opacity-80 md:block -z-20" aria-hidden="true">
        <Image src={Illustration02} className="max-w-none" width={1440} height={427} alt="Page Illustration 02" />
      </div>

      {/* Radial gradient */}
      <div className="absolute top-0 left-1/2 flex aspect-square w-[800px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full opacity-30 blur-[120px]">
        <div className="absolute inset-0 translate-z-0 rounded-full bg-purple-500" />
        <div className="absolute h-64 w-64 translate-z-0 rounded-full bg-purple-400 opacity-80 blur-[80px]" />
      </div>

      {/* Particles animation */}
      <Particles className="absolute inset-0 h-96 -z-10" quantity={15} />

      {/* Illustration */}
      <div className="pointer-events-none absolute left-1/2 -mt-16 -translate-x-1/2 blur-2xl opacity-80 md:block -z-20" aria-hidden="true">
        <Image src={Illustration} className="max-w-none" width={1440} height={427} alt="Page Illustration" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pt-32 md:pt-40">
          <div className="md:flex md:items-start md:justify-between">
            {/* Page content */}
            <div className="pb-12 md:grow md:pb-20">
              <div className="max-w-[720px]">
                <div className="flex flex-col space-y-6 lg:flex-row lg:space-y-0 lg:space-x-16">
                  {/* Back button */}
                  <div className="shrink-0">
                    <div className="sticky top-6">
                      <Link
                        className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-transparent [background:linear-gradient(var(--color-slate-900),var(--color-slate-900))_padding-box,conic-gradient(var(--color-slate-400),var(--color-slate-700)_25%,var(--color-slate-700)_75%,var(--color-slate-400)_100%)_border-box]"
                        href="/integrations"
                      >
                        <span className="sr-only">Go back</span>
                        <svg className="h-4 w-4 fill-purple-500 transition group-hover:scale-105" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6.7 14.7 8.1 13.3 3.8 9H16V7H3.8l4.3-4.3L6.7 1.3 0 8z" />
                        </svg>
                      </Link>
                    </div>
                  </div>

                  <article className="pb-12">
                    <figure className="mb-8 rounded-3xl border border-slate-300/10 bg-slate-700/20 p-4">
                      <Image className="w-full rounded-2xl" src={IntegrationImg} width={586} height={316} alt={`${integration.name} integration preview`} priority />
                    </figure>

                    <header className="space-y-6">
                      <div className="inline-flex items-center gap-3 rounded-full border border-slate-600/60 bg-slate-800/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32rem] text-purple-200/80">
                        CRM Integration
                      </div>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-600 bg-slate-800/70 p-2">
                          <Image src={integration.logo} alt={integration.name} width={36} height={36} />
                        </div>
                        <div>
                          <h1 className="text-3xl font-semibold text-white sm:text-4xl">Connect EarlyBird AI with {integration.name}</h1>
                          <p className="mt-3 text-base text-slate-300">{integration.summary}</p>
                        </div>
                      </div>
                    </header>

                    <div className="mt-10 space-y-12 text-slate-300">
                      <section>
                        <h2 className="text-xl font-semibold text-white">Overview</h2>
                        <div className="mt-4 space-y-4 text-base leading-relaxed text-slate-300">
                          {integration.overview.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                          ))}
                        </div>
                      </section>

                      <section>
                        <h2 className="text-xl font-semibold text-white">What syncs automatically</h2>
                        <ul className="mt-4 space-y-3 text-base text-slate-300">
                          {integration.syncHighlights.map((highlight) => (
                            <li key={highlight} className="flex items-start gap-3">
                              <span className="mt-2 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-purple-400" aria-hidden />
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </section>

                      <section>
                        <h2 className="text-xl font-semibold text-white">Launch in minutes</h2>
                        <ol className="mt-4 space-y-3 text-base text-slate-300">
                          {integration.setupSteps.map((step, idx) => (
                            <li key={step} className="flex items-start gap-3">
                              <span className="mt-1 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-purple-200/90">
                                {idx + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </section>

                      <section>
                        <h2 className="text-xl font-semibold text-white">Playbooks we recommend</h2>
                        <ul className="mt-4 space-y-3 text-base text-slate-300">
                          {integration.playbooks.map((playbook) => (
                            <li key={playbook} className="flex items-start gap-3">
                              <span className="mt-2 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400" aria-hidden />
                              <span>{playbook}</span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    </div>
                  </article>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="md:ml-12 md:w-[280px] md:flex-shrink-0">
              <div className="sticky top-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.5)]">
                <h2 className="text-sm font-semibold uppercase tracking-[0.24rem] text-slate-400">Integration details</h2>
                <dl className="mt-6 space-y-4 text-sm text-slate-300">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-400">Website</dt>
                    <dd>
                      <Link className="inline-flex items-center gap-1 text-purple-300 hover:text-purple-200" href={integration.website} target="_blank" rel="noopener noreferrer">
                        <span>{new URL(integration.website).hostname}</span>
                        <svg className="h-3 w-3 fill-current" xmlns="http://www.w3.org/2000/svg" width="9" height="9">
                          <path d="m1.285 8.514-.909-.915 5.513-5.523H1.663l.01-1.258h6.389v6.394H6.794l.01-4.226z" />
                        </svg>
                      </Link>
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-400">Industry</dt>
                    <dd className="font-medium text-slate-200">{integration.industry}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-400">Trusted by</dt>
                    <dd className="font-medium text-slate-200">{integration.installBase}</dd>
                  </div>
                </dl>

                <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-800/60 p-4 text-sm text-slate-300">
                  <p className="font-medium text-white">Need help enabling the sync?</p>
                  <p className="mt-2">
                    Our solutions team will configure mappings, automations, and QA the first live calls so your crew can focus on running the business.
                  </p>
                  <Link className="mt-4 inline-flex items-center gap-2 text-purple-300 hover:text-purple-100" href="/contact">
                    <span>Chat with onboarding</span>
                    <svg className="h-3 w-3 fill-current" xmlns="http://www.w3.org/2000/svg" width="9" height="9">
                      <path d="m1.285 8.514-.909-.915 5.513-5.523H1.663l.01-1.258h6.389v6.394H6.794l.01-4.226z" />
                    </svg>
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
