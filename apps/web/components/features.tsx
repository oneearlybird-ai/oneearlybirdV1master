'use client'

import { useMemo, useState } from 'react'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Illustration from '@/public/images/glow-top.svg'

type ReceptionistCard = {
  title: string;
  description: string;
  bullets: string[];
};

export default function Features() {
  const [tab, setTab] = useState<number>(1)
  const [testStatus, setTestStatus] = useState<'idle' | 'prompting' | 'ready' | 'error' | 'unsupported'>('idle')
  const router = useRouter()

  const receptionistCards = useMemo<ReceptionistCard[]>(
    () => [
      {
        title: 'Answers & triages',
        description: 'Picks up within a second, follows your playbook, and qualifies callers before your phone ever rings.',
        bullets: ['Intent-aware greetings', 'Escalates VIPs instantly', 'Dynamic scripts by line'],
      },
      {
        title: 'Books & updates',
        description: 'Schedules, reschedules, and cancels visits through your calendars without a human in the loop.',
        bullets: ['Two-way calendar sync', 'CRM + ServiceTitan handoff', 'Smart reminders for no-shows'],
      },
      {
        title: 'Logs every detail',
        description: 'Transcripts, tags, and recordings land in one place so ops and sales stay aligned.',
        bullets: ['Live transcript streaming', 'Auto-tag every conversation', 'Shareable recap links'],
      },
    ],
    []
  )

  async function startReceptionistDemo() {
    if (testStatus === 'prompting') return

    if (!navigator?.mediaDevices?.getUserMedia) {
      setTestStatus('unsupported')
      return
    }

    try {
      setTestStatus('prompting')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
      setTestStatus('ready')

      setTimeout(() => {
        router.push('/preview?demo=voice')
      }, 900)
    } catch (error) {
      console.warn('microphone_permission_denied', error)
      setTestStatus('error')
    }
  }

  return (
    <section>
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">

        {/* Illustration */}
        <div className="absolute inset-0 -z-10 -mx-28 rounded-t-[3rem] pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 -z-10">
            <Image src={Illustration} className="max-w-none" width={1404} height={658} alt="Features Illustration" />
          </div>
        </div>

        <div className="pt-16 pb-12 md:pt-52 md:pb-20">

          <div>

            {/* Section content */}
            <div className="max-w-xl mx-auto md:max-w-none flex flex-col md:flex-row md:space-x-8 lg:space-x-16 xl:space-x-20 space-y-8 space-y-reverse md:space-y-0">

              {/* Content */}
              <div className="md:w-7/12 lg:w-1/2 order-1 md:order-none max-md:text-center" data-aos="fade-down">
                {/* Content #1 */}
                <div>
                  <div className="inline-flex font-medium bg-clip-text text-transparent bg-linear-to-r from-purple-500 to-purple-200 pb-3">Built for always-on operations</div>
                </div>
                <h3 className="h3 bg-clip-text text-transparent bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 pb-3">Every inbound call handled end-to-end</h3>
                <p className="text-lg text-slate-400 mb-8">EarlyBird answers in under a second, schedules visits, hands off hot leads, and logs transcripts so your team never misses revenue or context.</p>
                <div className="mt-8 max-w-xs max-md:mx-auto space-y-2">
                  <button className={`flex items-center text-sm font-medium text-slate-50 rounded-sm border bg-slate-800/25 w-full px-3 py-2 transition duration-150 ease-in-out hover:opacity-100 ${tab !== 1 ? 'border-slate-700 opacity-50' : 'border-purple-700 shadow-sm shadow-purple-500/25'}`} onClick={() => setTab(1)}>
                    <svg className="shrink-0 fill-slate-300 mr-3" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                      <path d="M14 0a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h12Zm0 14V2H2v12h12Zm-3-7H5a1 1 0 1 1 0-2h6a1 1 0 0 1 0 2Zm0 4H5a1 1 0 0 1 0-2h6a1 1 0 0 1 0 2Z" />
                    </svg>
                    <span>24/7 coverage</span>
                  </button>
                  <button className={`flex items-center text-sm font-medium text-slate-50 rounded-sm border bg-slate-800/25 w-full px-3 py-2 transition duration-150 ease-in-out hover:opacity-100 ${tab !== 2 ? 'border-slate-700 opacity-50' : 'border-purple-700 shadow-sm shadow-purple-500/25'}`} onClick={() => setTab(2)}>
                    <svg className="shrink-0 fill-slate-300 mr-3" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                      <path d="M2 6H0V2a2 2 0 0 1 2-2h4v2H2v4ZM16 6h-2V2h-4V0h4a2 2 0 0 1 2 2v4ZM14 16h-4v-2h4v-4h2v4a2 2 0 0 1-2 2ZM6 16H2a2 2 0 0 1-2-2v-4h2v4h4v2Z" />
                    </svg>
                    <span>Booking & routing</span>
                  </button>
                  <button className={`flex items-center text-sm font-medium text-slate-50 rounded-sm border bg-slate-800/25 w-full px-3 py-2 transition duration-150 ease-in-out hover:opacity-100 ${tab !== 3 ? 'border-slate-700 opacity-50' : 'border-purple-700 shadow-sm shadow-purple-500/25'}`} onClick={() => setTab(3)}>
                    <svg className="shrink-0 fill-slate-300 mr-3" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                      <path d="M14.3.3c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4l-8 8c-.2.2-.4.3-.7.3-.3 0-.5-.1-.7-.3-.4-.4-.4-1 0-1.4l8-8ZM15 7c.6 0 1 .4 1 1 0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8c.6 0 1 .4 1 1s-.4 1-1 1C4.7 2 2 4.7 2 8s2.7 6 6 6 6-2.7 6-6c0-.6.4-1 1-1Z" />
                    </svg>
                    <span>CRM & analytics</span>
                  </button>
                </div>
              </div>

              {/* Interactive preview */}
              <div className="md:w-5/12 lg:w-1/2 space-y-5" data-aos="fade-left" data-aos-delay="150">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <h4 className="text-lg font-semibold text-white">Meet your new receptionist</h4>
                  <p className="mt-3 text-sm text-white/70">Say hello to the agent that not only answers, but also routes, books, and documents every conversation.</p>
                  <div className="mt-6 space-y-4">
                    {receptionistCards.map((card, index) => (
                      <div
                        key={card.title}
                        className="rounded-2xl border border-white/12 bg-white/[0.04] p-5"
                        data-aos="fade-left"
                        data-aos-delay={200 + index * 80}
                      >
                        <h5 className="text-sm font-semibold text-white">{card.title}</h5>
                        <p className="mt-2 text-sm text-white/65">{card.description}</p>
                        <ul className="mt-3 space-y-1.5 text-xs text-white/60">
                          {card.bullets.map((bullet) => (
                            <li key={bullet} className="flex items-start gap-2">
                              <span aria-hidden="true" className="mt-1 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={startReceptionistDemo}
                      className="btn w-full justify-center bg-white text-slate-900 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                    >
                      Test our agent now
                    </button>
                    <p className="mt-3 text-xs text-white/60" aria-live="polite">
                      {testStatus === 'idle' && 'Click to grant microphone access and connect with the live demo.'}
                      {testStatus === 'prompting' && 'Requesting microphone access… allow access to continue.'}
                      {testStatus === 'ready' && 'Microphone ready! Opening the live preview…'}
                      {testStatus === 'error' && 'We could not access your microphone. Check your browser permissions and try again.'}
                      {testStatus === 'unsupported' && 'This browser is missing microphone access support. Try updating or switching browsers.'}
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  )
}
