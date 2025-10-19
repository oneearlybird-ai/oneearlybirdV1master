'use client'

import { useMemo, useState } from 'react'

import Image from 'next/image'
import { Transition } from '@headlessui/react'
import Particles from './particles'
import Illustration from '@/public/images/glow-top.svg'
import { useRouter } from 'next/navigation'

type ReceptionistCard = {
  title: string
  description: string
  bullets: string[]
}

export default function Features() {
  const [tab, setTab] = useState<number>(1)
  const [testStatus, setTestStatus] = useState<'idle' | 'prompting' | 'ready' | 'error' | 'unsupported'>('idle')
  const router = useRouter()

  const receptionistCards = useMemo<ReceptionistCard[]>(
    () => [
      {
        title: 'Answers & triages',
        description: 'Greets callers in under a second, detects urgency, and follows the script you configure.',
        bullets: ['Intent-aware greetings', 'Escalates VIPs instantly', 'Dynamic scripts per number'],
      },
      {
        title: 'Books & updates',
        description: 'Schedules, reschedules, and cancels visits across your calendars with no human hand-off.',
        bullets: ['Two-way calendar sync', 'CRM & ServiceTitan handoff', 'Smart reminders and confirmations'],
      },
      {
        title: 'Logs every detail',
        description: 'Transcripts, tags, and recordings land in one place so ops, sales, and support stay aligned.',
        bullets: ['Live transcript streaming', 'Auto-tags every conversation', 'Shareable recap links'],
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
            <div className="max-w-xl mx-auto md:max-w-none">
              <div className="space-y-10 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-16 lg:space-y-0">

                {/* Original feature content + animation */}
                <div className="flex flex-col md:flex-row md:space-x-8 lg:space-x-16 xl:space-x-20 space-y-8 md:space-y-0">

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

                  {/* Image */}
                  <div className="md:w-5/12 lg:w-1/2" data-aos="fade-up" data-aos-delay="100">
                    <div className="relative py-24 -mt-12">

                      {/* Particles animation */}
                      <Particles className="absolute inset-0 -z-10" quantity={8} staticity={30} />

                      <div className="flex items-center justify-center">
                        <div className="relative w-48 h-48 flex justify-center items-center">
                          {/* Halo effect */}
                          <svg className="absolute inset-0 -z-10 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 will-change-transform pointer-events-none blur-md" width="480" height="480" viewBox="0 0 480 480" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                              <linearGradient id="pulse-a" x1="50%" x2="50%" y1="100%" y2="0%">
                                <stop offset="0%" stopColor="#A855F7" />
                                <stop offset="76.382%" stopColor="#FAF5FF" />
                                <stop offset="100%" stopColor="#6366F1" />
                              </linearGradient>
                            </defs>
                            <g fillRule="evenodd">
                              <path className="pulse" fill="url(#pulse-a)" fillRule="evenodd" d="M240,0 C372.5484,0 480,107.4516 480,240 C480,372.5484 372.5484,480 240,480 C107.4516,480 0,372.5484 0,240 C0,107.4516 107.4516,0 240,0 Z M240,88.8 C156.4944,88.8 88.8,156.4944 88.8,240 C88.8,323.5056 156.4944,391.2 240,391.2 C323.5056,391.2 391.2,323.5056 391.2,240 C391.2,156.4944 323.5056,88.8 240,88.8 Z" />
                              <path className="pulse pulse-1" fill="url(#pulse-a)" fillRule="evenodd" d="M240,0 C372.5484,0 480,107.4516 480,240 C480,372.5484 372.5484,480 240,480 C107.4516,480 0,372.5484 0,240 C0,107.4516 107.4516,0 240,0 Z M240,88.8 C156.4944,88.8 88.8,156.4944 88.8,240 C88.8,323.5056 156.4944,391.2 240,391.2 C323.5056,391.2 391.2,323.5056 391.2,240 C391.2,156.4944 323.5056,88.8 240,88.8 Z" />
                              <path className="pulse pulse-2" fill="url(#pulse-a)" fillRule="evenodd" d="M240,0 C372.5484,0 480,107.4516 480,240 C480,372.5484 372.5484,480 240,480 C107.4516,480 0,372.5484 0,240 C0,107.4516 107.4516,0 240,0 Z M240,88.8 C156.4944,88.8 88.8,156.4944 88.8,240 C88.8,323.5056 156.4944,391.2 240,391.2 C323.5056,391.2 391.2,323.5056 391.2,240 C391.2,156.4944 323.5056,88.8 240,88.8 Z" />
                            </g>
                          </svg>
                          {/* Grid */}
                          <div className="absolute inset-0 -z-10 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none w-[500px] h-[500px] rounded-full overflow-hidden [mask-image:_radial-gradient(black,_transparent_60%)]">
                            <div className="h-[200%] animate-endless">
                              <div className="absolute inset-0 [background:repeating-linear-gradient(transparent,transparent_48px,var(--color-white)_48px,var(--color-white)_49px)] blur-[2px] opacity-20" />
                              <div className="absolute inset-0 [background:repeating-linear-gradient(transparent,transparent_48px,var(--color-purple-500)_48px,var(--color-purple-500)_49px)]" />
                              <div className="absolute inset-0 [background:repeating-linear-gradient(90deg,transparent,transparent_48px,var(--color-white)_48px,var(--color-white)_49px)] blur-[2px] opacity-20" />
                              <div className="absolute inset-0 [background:repeating-linear-gradient(90deg,transparent,transparent_48px,var(--color-purple-500)_48px,var(--color-purple-500)_49px)]" />
                            </div>
                          </div>
                          {/* Icons */}
                          <Transition
                            as="div"
                            show={tab === 1}
                            className={`transform transition ease-[cubic-bezier(0.68,-0.3,0.32,1)] data-closed:absolute data-enter:data-closed:-rotate-[60deg] data-leave:data-closed:rotate-[60deg] data-closed:opacity-0 duration-700`}
                            unmount={false}
                            appear={true}
                          >
                            <div className="relative flex items-center justify-center w-16 h-16 border border-transparent rounded-2xl shadow-2xl -rotate-[14deg] [background:linear-gradient(var(--color-slate-900),var(--color-slate-900))_padding-box,conic-gradient(var(--color-slate-400),var(--color-slate-700)_25%,var(--color-slate-700)_75%,var(--color-slate-400)_100%)_border-box] before:absolute before:inset-0 before:bg-slate-800/30 before:rounded-2xl">
                              <svg className="relative fill-slate-200" xmlns="http://www.w3.org/2000/svg" width="23" height="25">
                                <path fillRule="nonzero" d="M10.55 15.91H.442L14.153.826 12.856 9.91h10.107L9.253 24.991l1.297-9.082Zm.702-8.919L4.963 13.91h7.893l-.703 4.918 6.289-6.918H10.55l.702-4.918Z" />
                              </svg>
                            </div>
                          </Transition>
                          <Transition
                            as="div"
                            show={tab === 2}
                            className={`transform transition ease-[cubic-bezier(0.68,-0.3,0.32,1)] data-closed:absolute data-enter:data-closed:-rotate-[60deg] data-leave:data-closed:rotate-[60deg] data-closed:opacity-0 duration-700`}
                            unmount={false}
                            appear={true}
                          >
                            <div className="relative flex items-center justify-center w-16 h-16 border border-transparent rounded-2xl shadow-2xl -rotate-[14deg] [background:linear-gradient(var(--color-slate-900),var(--color-slate-900))_padding-box,conic-gradient(var(--color-slate-400),var(--color-slate-700)_25%,var(--color-slate-700)_75%,var(--color-slate-400)_100%)_border-box] before:absolute before:inset-0 before:bg-slate-800/30 before:rounded-2xl">
                              <svg className="relative fill-slate-200" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
                                <path d="M18 14h-2V8h2c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4v2H8V4c0-2.2-1.8-4-4-4S0 1.8 0 4s1.8 4 4 4h2v6H4c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4v-2h6v2c0 2.2 1.8 4 4 4s4-1.8 4-4-1.8-4-4-4ZM16 4c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2h-2V4ZM2 4c0-1.1.9-2 2-2s2 .9 2 2v2H4c-1.1 0-2-.9-2-2Zm4 14c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2h2v2ZM8 8h6v6H8V8Zm10 12c-1.1 0-2-.9-2-2v-2h2c1.1 0 2 .9 2 2s-.9 2-2 2Z" />
                              </svg>
                            </div>
                          </Transition>
                          <Transition
                            as="div"
                            show={tab === 3}
                            className={`transform transition ease-[cubic-bezier(0.68,-0.3,0.32,1)] data-closed:absolute data-enter:data-closed:-rotate-[60deg] data-leave:data-closed:rotate-[60deg] data-closed:opacity-0 duration-700`}
                            unmount={false}
                            appear={true}
                          >
                            <div className="relative flex items-center justify-center w-16 h-16 border border-transparent rounded-2xl shadow-2xl -rotate-[14deg] [background:linear-gradient(var(--color-slate-900),var(--color-slate-900))_padding-box,conic-gradient(var(--color-slate-400),var(--color-slate-700)_25%,var(--color-slate-700)_75%,var(--color-slate-400)_100%)_border-box] before:absolute before:inset-0 before:bg-slate-800/30 before:rounded-2xl">
                              <svg className="relative fill-slate-200" xmlns="http://www.w3.org/2000/svg" width="26" height="14">
                                <path fillRule="nonzero" d="m10 5.414-8 8L.586 12 10 2.586l6 6 8-8L25.414 2 16 11.414z" />
                              </svg>
                            </div>
                          </Transition>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Receptionist preview */}
                <div className="space-y-5" data-aos="fade-left" data-aos-delay="200">
                  <h3 className="h3 bg-clip-text text-transparent bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 pb-3">Meet your new receptionist</h3>
                  <div className="space-y-4">
                    {receptionistCards.map((card, index) => (
                      <div
                        key={card.title}
                        className="rounded-2xl border border-white/12 bg-white/[0.05] p-5 shadow-[0_12px_32px_rgba(15,14,32,0.35)] backdrop-blur"
                        data-aos="fade-left"
                        data-aos-delay={260 + index * 120}
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
                  <div>
                    <button
                      type="button"
                      onClick={startReceptionistDemo}
                      className="relative inline-flex w-full items-center justify-center overflow-hidden rounded-full border border-transparent px-6 py-3 text-sm font-semibold text-white transition duration-150 ease-in-out [background:linear-gradient(var(--color-purple-500),var(--color-purple-500))_padding-box,linear-gradient(var(--color-purple-500),var(--color-purple-200)_75%,transparent_100%)_border-box] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900/80"
                    >
                      <span className="relative inline-flex items-center gap-2">
                        <span>Test our agent now</span>
                        <span aria-hidden="true" className="text-purple-200">→</span>
                      </span>
                    </button>
                    <p className="mt-3 text-xs text-white/60" aria-live="polite">
                      {testStatus === 'idle' && 'Click to grant microphone access and start a live call demo.'}
                      {testStatus === 'prompting' && 'Requesting microphone access… allow it to continue.'}
                      {testStatus === 'ready' && 'Microphone ready! Opening the preview experience…'}
                      {testStatus === 'error' && 'We could not access the microphone. Check your browser permissions and try again.'}
                      {testStatus === 'unsupported' && 'Your browser does not support microphone access. Switch to a modern browser to test the agent.'}
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
