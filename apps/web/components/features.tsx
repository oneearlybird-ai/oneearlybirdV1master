'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import Image from 'next/image'
import Illustration from '@/public/images/glow-top.svg'

type FeaturePane = {
  title: string
  description: string
  bullets: string[]
}

type Testimony = {
  label: string
  value: string
}

export default function Features() {
  const [tab, setTab] = useState<number>(1)
  const [widgetReady, setWidgetReady] = useState(false)
  const [widgetMounted, setWidgetMounted] = useState(false)

  const widgetElementRef = useRef<HTMLElement | null>(null)
  const widgetContainerRef = useRef<HTMLDivElement | null>(null)
  const floatingReadyRef = useRef(false)
  const pendingAutoClickRef = useRef(false)
  const observerRegistryRef = useRef<MutationObserver[]>([])
  const expandHandlerRef = useRef<(() => void) | null>(null)

  const panes = useMemo<FeaturePane[]>(
    () => [
      {
        title: 'Answers & triages',
        description: 'Greets callers in under a second, follows your playbook, and hands off VIPs instantly.',
        bullets: ['Intent-aware greetings', 'Escalates the right calls', 'Conversational routing'],
      },
      {
        title: 'Books & updates',
        description: 'Schedules, reschedules, and cancels visits across your live calendars without human support.',
        bullets: ['Two-way calendar sync', 'Seamless CRM handoff', 'Automated reminders'],
      },
      {
        title: 'Logs every detail',
        description: 'Transcripts, tags, and recordings live in one place so ops and sales always stay aligned.',
        bullets: ['Live transcript streaming', 'Auto-tag every conversation', 'Shareable recap links'],
      },
    ],
    [],
  )

  const metrics = useMemo<Testimony[]>(
    () => [
      { label: 'Avg. pickup', value: '0.9s' },
      { label: 'Bookings captured', value: '+37%' },
      { label: 'Call coverage', value: '24 / 7' },
    ],
    [],
  )

  const customizeWidget = useCallback(
    (element?: HTMLElement) => {
      const host = element ?? widgetElementRef.current
      if (!host || !host.shadowRoot) {
        return
      }

      const shadow = host.shadowRoot

      const avatarWrapper = Array.from(shadow.querySelectorAll('div')).find((node) => {
        if (!(node instanceof HTMLElement)) return false
        const className = node.className || ''
        return className.includes('relative') && className.includes('w-16') && className.includes('h-16')
      })
      if (avatarWrapper instanceof HTMLElement && !avatarWrapper.dataset.ebWidgetAvatarHidden) {
        avatarWrapper.dataset.ebWidgetAvatarHidden = 'true'
        avatarWrapper.style.display = 'none'
      }

      const invokeFloatingButton = () => {
        const floatingButton = shadow.querySelector<HTMLButtonElement>(
          'div[data-eb-widget-floating="true"] button[aria-label="Start call"]',
        )
        if (floatingButton && !floatingButton.disabled) {
          floatingButton.click()
          pendingAutoClickRef.current = false
          return true
        }
        return false
      }

      const floatingContainers = Array.from(shadow.querySelectorAll('div')).filter((node) => {
        if (!(node instanceof HTMLElement)) return false
        const className = node.className || ''
        return className.includes('absolute') && className.includes('translate-y-1/2') && className.includes('left-1/2')
      }) as HTMLElement[]

      floatingContainers.forEach((container) => {
        if (!container.dataset.ebWidgetFloating) {
          container.dataset.ebWidgetFloating = 'true'
          container.style.opacity = '0'
          container.style.pointerEvents = 'none'
        }

        const floatingButton = container.querySelector<HTMLButtonElement>('button[aria-label="Start call"]')
        if (floatingButton && !floatingButton.dataset.ebWidgetCircleObserver) {
          floatingButton.dataset.ebWidgetCircleObserver = 'true'
          const observer = new MutationObserver(() => {
            const disabled = floatingButton.hasAttribute('disabled')
            if (!disabled) {
              floatingReadyRef.current = true
              if (pendingAutoClickRef.current) {
                requestAnimationFrame(() => {
                  invokeFloatingButton()
                })
              }
            }
          })
          observer.observe(floatingButton, { attributes: true, attributeFilter: ['disabled'] })
          observerRegistryRef.current.push(observer)

          if (!floatingButton.disabled) {
            floatingReadyRef.current = true
          }
        }
      })

      shadow.querySelectorAll<HTMLButtonElement>('button[aria-label="Start call"]').forEach((button) => {
        const container = button.closest('div')
        const className = container?.className || ''
        const isFloating = className.includes('translate-y-1/2') && className.includes('left-1/2')

        if (isFloating) {
          if (!button.dataset.ebWidgetCirclePrepared) {
            button.dataset.ebWidgetCirclePrepared = 'true'
            button.style.opacity = '0'
            button.style.pointerEvents = 'none'
          }
          return
        }

        if (!button.dataset.ebWidgetPrimaryBound) {
          button.dataset.ebWidgetPrimaryBound = 'true'
          button.addEventListener(
            'click',
            () => {
              if (invokeFloatingButton()) {
                return
              }

              pendingAutoClickRef.current = true

              if (expandHandlerRef.current) {
                window.removeEventListener('elevenlabs-agent:expand', expandHandlerRef.current)
                expandHandlerRef.current = null
              }

              const handleExpand = () => {
                const tryClick = () => {
                  if (invokeFloatingButton()) {
                    expandHandlerRef.current = null
                    return
                  }
                  if (pendingAutoClickRef.current) {
                    requestAnimationFrame(tryClick)
                  }
                }

                requestAnimationFrame(tryClick)
              }

              expandHandlerRef.current = handleExpand
              window.addEventListener('elevenlabs-agent:expand', handleExpand, { once: true })
            },
            { capture: true },
          )
        }
      })
    },
    [],
  )

  const syncWidgetLayout = useCallback(
    (element?: HTMLElement) => {
      const host = element ?? widgetElementRef.current
      if (!host) {
        return false
      }

      host.style.position = 'relative'
      host.style.top = 'auto'
      host.style.right = 'auto'
      host.style.bottom = 'auto'
      host.style.left = 'auto'
      host.style.pointerEvents = 'auto'
      host.style.display = 'block'
      host.style.width = '100%'
      host.style.height = '100%'
      host.style.zIndex = 'auto'
      host.style.margin = '0'
      host.style.overflow = 'hidden'
      host.style.setProperty('--el-overlay-padding', '0px')

      const shadow = host.shadowRoot
      if (!shadow) {
        return false
      }

      const overlay = shadow.querySelector<HTMLElement>('.overlay')
      if (!overlay) {
        return false
      }

      overlay.style.position = 'absolute'
      overlay.style.top = '0'
      overlay.style.right = '0'
      overlay.style.bottom = '0'
      overlay.style.left = '0'
      overlay.style.width = '100%'
      overlay.style.height = '100%'
      overlay.style.flexDirection = 'column'
      overlay.style.justifyContent = 'stretch'
      overlay.style.alignItems = 'stretch'
      overlay.style.pointerEvents = 'auto'
      overlay.style.margin = '0'

      overlay.querySelectorAll<HTMLElement>('[class*="max-w"]').forEach((panel) => {
        panel.style.maxWidth = '100%'
        panel.style.maxHeight = '100%'
        panel.style.width = '100%'
        panel.style.height = '100%'
        panel.style.top = '0'
        panel.style.left = '0'
        panel.style.position = 'relative'
        panel.style.margin = '0'
      })

      customizeWidget(host)

      return true
    },
    [customizeWidget],
  )

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleReady = () => setWidgetReady(true)
    const existingScript = document.getElementById('elevenlabs-convai-script') as HTMLScriptElement | null

    if (existingScript) {
      if (existingScript.dataset.loaded === 'true') {
        setWidgetReady(true)
      } else {
        existingScript.addEventListener('load', handleReady, { once: true })
      }
      return () => existingScript.removeEventListener('load', handleReady)
    }

    const script = document.createElement('script')
    script.id = 'elevenlabs-convai-script'
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed'
    script.async = true
    script.type = 'text/javascript'
    script.dataset.loaded = 'false'
    script.addEventListener(
      'load',
      () => {
        script.dataset.loaded = 'true'
        handleReady()
      },
      { once: true },
    )
    script.addEventListener(
      'error',
      () => {
        console.warn('convai_widget_failed_to_load')
        setWidgetReady(false)
      },
      { once: true },
    )

    document.body.appendChild(script)

    return () => {
      script.removeEventListener('load', handleReady)
    }
  }, [])

  useEffect(() => {
    if (!widgetReady || !widgetContainerRef.current) {
      return
    }

    if (!widgetElementRef.current) {
      const element = document.createElement('elevenlabs-convai')
      element.setAttribute('agent-id', 'agent_7601k7z0n6a0ex9t8tfta2vqs6jn')
      element.setAttribute('variant', 'full')
      element.setAttribute('always-expanded', 'false')
      element.setAttribute('default-expanded', 'false')
      element.setAttribute('transcript', 'true')
      element.setAttribute('text-input', 'true')
      element.style.display = 'block'
      element.style.width = '100%'
      element.style.height = '100%'
      widgetContainerRef.current.appendChild(element)
      widgetElementRef.current = element
    }

    const host = widgetElementRef.current
    if (!host) {
      return
    }

    let cancelled = false
    let frame: number | undefined
    let mutationObserver: MutationObserver | undefined

    const attemptSync = () => {
      if (cancelled) {
        return
      }

      if (!syncWidgetLayout(host)) {
        frame = window.requestAnimationFrame(attemptSync)
        return
      }

      setWidgetMounted((prev) => (prev ? prev : true))

      const shadow = host.shadowRoot
      if (!shadow) {
        frame = window.requestAnimationFrame(attemptSync)
        return
      }

      mutationObserver?.disconnect()
      mutationObserver = new MutationObserver(() => {
        syncWidgetLayout(host)
      })
      mutationObserver.observe(shadow, { childList: true, subtree: true, attributes: true })
    }

    attemptSync()

    const handleResize = () => {
      syncWidgetLayout(host)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelled = true
      if (frame) {
        window.cancelAnimationFrame(frame)
      }
      mutationObserver?.disconnect()
      window.removeEventListener('resize', handleResize)
    }
  }, [syncWidgetLayout, widgetReady])

  useEffect(() => {
    return () => {
      if (widgetElementRef.current) {
        widgetElementRef.current.remove()
        widgetElementRef.current = null
      }

      observerRegistryRef.current.forEach((observer) => observer.disconnect())
      observerRegistryRef.current = []
      pendingAutoClickRef.current = false

      if (expandHandlerRef.current) {
        window.removeEventListener('elevenlabs-agent:expand', expandHandlerRef.current)
        expandHandlerRef.current = null
      }
    }
  }, [])

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="absolute inset-0 -z-10 -mx-24 rounded-t-[3rem] bg-gradient-to-b from-[#0C1120] via-[#0C0F1A] to-[#06070E]" aria-hidden="true">
          <Image src={Illustration} alt="Background glow" className="absolute inset-x-0 -top-12 w-full opacity-70" />
        </div>

        <div className="grid gap-10 py-20 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
          <div className="space-y-10">
            <div className="space-y-6">
              <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.4rem] text-white/60">
                Always-on front desk
              </span>
              <h2 className="text-3xl font-semibold text-white sm:text-4xl lg:text-[2.8rem]">
                Stop missing revenue. Let EarlyBird answer, qualify, and book every call 24/7.
              </h2>
              <p className="max-w-xl text-base text-white/70">
                The voice agent that sounds on-brand, handles objections, books jobs on your calendars, and posts the transcript everywhere your team works.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-white/70">
              {metrics.map((metric) => (
                <div key={metric.label} className="flex min-w-[140px] flex-col rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span className="text-2xl font-semibold text-white">{metric.value}</span>
                  <span className="text-xs uppercase tracking-[0.2rem] text-white/40">{metric.label}</span>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <span className="inline-flex rounded-full border border-purple-500/30 bg-purple-500/15 px-3 py-1 text-[10px] uppercase tracking-[0.3rem] text-purple-100">
                    Playbooks covered
                  </span>
                  <h3 className="text-lg font-semibold text-white">Every scenario, one agent</h3>
                </div>
                <div className="inline-flex h-10 items-center rounded-full border border-white/10 bg-white/5 px-4 text-xs uppercase tracking-[0.3rem] text-white/60">
                  Live preview
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3">
                {panes.map((pane, index) => (
                  <button
                    key={pane.title}
                    type="button"
                    onClick={() => setTab(index + 1)}
                    className={`flex flex-col rounded-2xl border px-4 py-3 text-left transition ${
                      tab === index + 1
                        ? 'border-purple-500/60 bg-purple-500/15 text-white'
                        : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span className="text-sm font-semibold">{pane.title}</span>
                    <span className="mt-1 text-xs">{pane.description}</span>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-white/50">
                      {pane.bullets.map((bullet) => (
                        <span key={bullet} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple-400" />
                          {bullet}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.4rem] text-purple-200/80">Live demo</p>
                  <p className="mt-1 text-base font-semibold text-white">Start a call with the agent</p>
                  <p className="mt-2 text-xs text-white/60">
                    Click “Start a call” in the panel to test the voice, booking flow, and notes. No downloads or extensions required.
                  </p>
                </div>
                <span className="inline-flex h-8 items-center rounded-full border border-purple-400/35 bg-purple-500/10 px-3 text-[10px] font-semibold uppercase tracking-[0.3rem] text-purple-100">
                  Live
                </span>
              </div>

              <div className="mt-6 rounded-[24px] border border-white/10 bg-slate-950/80 p-4">
                <div className="relative min-h-[360px] sm:min-h-[420px]">
                  <div ref={widgetContainerRef} className="absolute inset-0" />
                  {!widgetMounted && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm text-white/70">
                      <span className="h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-transparent" />
                      <span>Loading the voice agent…</span>
                    </div>
                  )}
                </div>
              </div>

              <p className="mt-3 text-[11px] text-white/45">
                Tip: allow the microphone prompt when it appears. The agent stays in this window, so there’s no new tab or awkward pop-up.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
