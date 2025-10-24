'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import Image from 'next/image'
import { Transition } from '@headlessui/react'
import Particles from './particles'
import Illustration from '@/public/images/glow-top.svg'

type StartStatus = 'idle' | 'starting' | 'ready' | 'retry' | 'error'

const AUTOSTART_MAX_FRAMES = 120
const AUTOSTART_TIMEOUT_MS = 2000

const isInteractive = (button: HTMLButtonElement | null): button is HTMLButtonElement => {
  if (!button) {
    return false
  }
  return (
    !button.hasAttribute('disabled') &&
    button.getAttribute('aria-disabled') !== 'true' &&
    !button.classList.contains('disabled')
  )
}

export default function Features() {
  const [tab, setTab] = useState<number>(1)
  const [widgetReady, setWidgetReady] = useState(false)
  const [widgetMounted, setWidgetMounted] = useState(false)
  const [startStatus, setStartStatus] = useState<StartStatus>('idle')
  const [startError, setStartError] = useState<string | null>(null)

  const widgetElementRef = useRef<HTMLElement | null>(null)
  const widgetContainerRef = useRef<HTMLDivElement | null>(null)
  const floatingButtonRef = useRef<HTMLButtonElement | null>(null)
  const pendingAutoClickRef = useRef(false)
  const observerRegistryRef = useRef<MutationObserver[]>([])
  const expandHandlerRef = useRef<(() => void) | null>(null)
  const fallbackTimerRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  const clearPendingAutoClick = useCallback(() => {
    pendingAutoClickRef.current = false
    if (fallbackTimerRef.current !== null) {
      window.clearTimeout(fallbackTimerRef.current)
      fallbackTimerRef.current = null
    }
  }, [])

  const invokeFloatingButton = useCallback(() => {
    const buttonCandidate = floatingButtonRef.current
    if (!(buttonCandidate instanceof HTMLButtonElement)) {
      return false
    }
    if (!isInteractive(buttonCandidate)) {
      return false
    }

    buttonCandidate.click()
    console.info('widget:start:sent')
    clearPendingAutoClick()
    setStartStatus('ready')
    console.info('widget:ready')
    return true
  }, [clearPendingAutoClick])

  const scheduleFloatingInvocation = useCallback(() => {
    let attempts = 0
    const attempt = () => {
      if (!pendingAutoClickRef.current) {
        return
      }
      if (invokeFloatingButton()) {
        return
      }
      attempts += 1
      if (attempts < AUTOSTART_MAX_FRAMES) {
        requestAnimationFrame(attempt)
      }
    }
    requestAnimationFrame(attempt)
  }, [invokeFloatingButton])

  const requestMicrophonePermission = useCallback(async () => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      setStartError('Microphone access is not supported in this browser.')
      console.info('mic:unsupported')
      return false
    }
    console.info('mic:prompted')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
      console.info('mic:granted')
      return true
    } catch (error) {
      console.info('mic:denied', error)
      setStartError('Microphone permission was denied. Allow access to continue.')
      return false
    }
  }, [])

  const ensureAudioContext = useCallback(async () => {
    const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextCtor) {
      console.info('audio:context:missing')
      return
    }
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextCtor()
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume()
    }
    console.info('audio:resumed')
  }, [])

  const handleStartClick = useCallback(() => {
    if (!widgetReady) {
      return
    }

    const run = async () => {
      clearPendingAutoClick()
      setStartStatus('starting')
      setStartError(null)

      const micGranted = await requestMicrophonePermission()
      if (!micGranted) {
        setStartStatus('error')
        return
      }

      await ensureAudioContext()

      pendingAutoClickRef.current = true

      if (invokeFloatingButton()) {
        return
      }

      if (expandHandlerRef.current) {
        window.removeEventListener('elevenlabs-agent:expand', expandHandlerRef.current)
        expandHandlerRef.current = null
      }

      const handleExpand = () => {
        scheduleFloatingInvocation()
        expandHandlerRef.current = null
      }

      expandHandlerRef.current = handleExpand
      window.addEventListener('elevenlabs-agent:expand', handleExpand, { once: true })

      scheduleFloatingInvocation()

      fallbackTimerRef.current = window.setTimeout(() => {
        if (pendingAutoClickRef.current) {
          pendingAutoClickRef.current = false
          setStartStatus('retry')
          setStartError('Starting… tap once more if prompted by your browser.')
          console.info('widget:start:timeout')
        }
      }, AUTOSTART_TIMEOUT_MS)
    }

    run().catch((error) => {
      console.error('widget:start:error', error)
      clearPendingAutoClick()
      setStartStatus('error')
      setStartError('Something went wrong while starting the call. Try again.')
    })
  }, [clearPendingAutoClick, ensureAudioContext, invokeFloatingButton, requestMicrophonePermission, scheduleFloatingInvocation, widgetReady])

  const customizeWidget = useCallback((element?: HTMLElement) => {
    const host = element ?? widgetElementRef.current
    if (!host || !host.shadowRoot) {
      return
    }

    const shadow = host.shadowRoot

    const largeAvatarWrapper = Array.from(shadow.querySelectorAll('div')).find((node) => {
      if (!(node instanceof HTMLElement)) {
        return false
      }
      const className = node.className || ''
      return className.includes('relative') && className.includes('w-16') && className.includes('h-16')
    })
    if (largeAvatarWrapper instanceof HTMLElement && !largeAvatarWrapper.dataset.ebWidgetAvatarHidden) {
      largeAvatarWrapper.dataset.ebWidgetAvatarHidden = 'true'
      largeAvatarWrapper.style.display = 'none'
    }

    const floatingContainers = Array.from(shadow.querySelectorAll('div')).filter((node) => {
      if (!(node instanceof HTMLElement)) {
        return false
      }
      const className = node.className || ''
      return className.includes('absolute') && className.includes('translate-y-1/2') && className.includes('left-1/2')
    }) as HTMLElement[]

    floatingContainers.forEach((container) => {
      container.style.opacity = '0'
      container.style.pointerEvents = 'none'
      container.setAttribute('aria-hidden', 'true')
      container.setAttribute('tabindex', '-1')

      const floatingButton = container.querySelector<HTMLButtonElement>('button[aria-label="Start call"]')
      if (floatingButton) {
        floatingButtonRef.current = floatingButton
        if (!floatingButton.dataset.ebWidgetCircleObserver) {
          floatingButton.dataset.ebWidgetCircleObserver = 'true'
          const observer = new MutationObserver(() => {
            if (pendingAutoClickRef.current) {
              scheduleFloatingInvocation()
            }
          })
          observer.observe(floatingButton, { attributes: true, attributeFilter: ['disabled', 'aria-disabled', 'class'] })
          observerRegistryRef.current.push(observer)
        }

        if (pendingAutoClickRef.current && isInteractive(floatingButton)) {
          invokeFloatingButton()
        }
      }
    })

    shadow.querySelectorAll<HTMLButtonElement>('button[aria-label="Start call"]').forEach((button) => {
      const container = button.closest('div')
      const className = container?.className || ''
      const isFloating = className.includes('translate-y-1/2') && className.includes('left-1/2')

      if (isFloating) {
        return
      }

      if (!button.dataset.ebWidgetPrimaryBound) {
        button.dataset.ebWidgetPrimaryBound = 'true'
        button.addEventListener(
          'click',
          (event) => {
            event.preventDefault()
            event.stopPropagation()
            handleStartClick()
          },
          { capture: true },
        )
      }
    })
  }, [handleStartClick, invokeFloatingButton, scheduleFloatingInvocation])

  const syncWidgetLayout = useCallback((element?: HTMLElement) => {
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
  }, [customizeWidget])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (window.customElements?.get('elevenlabs-convai')) {
      setWidgetReady(true)
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
      return () => {
        existingScript.removeEventListener('load', handleReady)
      }
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

      if (fallbackTimerRef.current !== null) {
        window.clearTimeout(fallbackTimerRef.current)
      }
      fallbackTimerRef.current = null
      pendingAutoClickRef.current = false

      if (expandHandlerRef.current) {
        window.removeEventListener('elevenlabs-agent:expand', expandHandlerRef.current)
        expandHandlerRef.current = null
      }
    }
  }, [])

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
                            <button
                              type="button"
                              onClick={() => {
                                const widget = widgetElementRef.current
                                if (!widget) {
                                  return
                                }
                                widget.dispatchEvent(
                                  new CustomEvent('elevenlabs-convai:call', {
                                    bubbles: true,
                                    composed: true,
                                    detail: { action: 'expand' },
                                  }),
                                )
                              }}
                              className="mt-4 inline-flex items-center gap-2 rounded-full border border-purple-400/60 bg-purple-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26rem] text-purple-100 shadow-[0_12px_30px_rgba(99,102,241,0.28)] transition hover:scale-[1.02] hover:border-purple-300 hover:bg-purple-500/30"
                            >
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-400/30 text-[11px] font-bold text-purple-100">
                                ▶
                              </span>
                              Try Call Now
                            </button>
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
                <div className="lg:-mt-24 lg:w-[340px] lg:justify-self-center">
                  <h3 className="h3 bg-clip-text text-transparent bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 pb-3">
                    Meet your new receptionist
                  </h3>
                  <div className="space-y-6">
                    <button
                      type="button"
                      onClick={handleStartClick}
                      className="w-full rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                    >
                      Start a call
                    </button>
                    <div className="text-xs text-white/60">
                      {startStatus === 'starting' && 'Starting… allow the microphone prompt if you see it.'}
                      {startStatus === 'ready' && 'Call starting. The agent will join momentarily.'}
                      {startStatus === 'retry' && (
                        <span className="inline-flex items-center gap-2">
                          {startError ?? 'Starting… tap once more if prompted by your browser.'}
                          <button
                            type="button"
                            onClick={handleStartClick}
                            className="rounded-full border border-white/20 px-3 py-1 text-xs text-white hover:border-white/40"
                          >
                            Try again
                          </button>
                        </span>
                      )}
                      {startStatus === 'error' && <span className="text-rose-300">{startError}</span>}
                    </div>
                    <div
                      className="group rounded-[32px] border border-white/10 bg-white/[0.035] p-5 pb-12 shadow-[0_18px_46px_rgba(15,14,32,0.48)] backdrop-blur transition-all duration-700"
                      data-aos="fade-up"
                      data-aos-delay="250"
                    >
                      <div className="space-y-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.32rem] text-purple-200/80">Live demo</p>
                            <p className="mt-1 text-base font-semibold text-white">Test the agent’s voice and brains</p>
                          </div>
                          <span className="inline-flex h-8 shrink-0 items-center rounded-full border border-purple-500/35 bg-purple-500/15 px-3 text-[11px] font-semibold uppercase tracking-[0.26rem] text-purple-200">
                            Live
                          </span>
                        </div>
                        <p className="text-sm text-white/75">
                          Say hello, hand it scenarios, or quiz it on your intake flow. You can watch transcripts, intent tags, and hand-off notes update in real time.
                        </p>
                      </div>
                    </div>
                    <div className="rounded-[32px] border border-white/12 bg-slate-950/45 shadow-[0_12px_32px_rgba(99,102,241,0.22)]">
                      <div className="rounded-[26px] border border-white/10 bg-slate-950/80 p-4 sm:p-5">
                        <div className="relative min-h-[360px] sm:min-h-[400px] lg:min-h-[460px]">
                          <div ref={widgetContainerRef} className="absolute inset-0" />
                          {!widgetMounted && (
                            <div className="absolute inset-0 flex items-center justify-center text-sm text-white/60">
                              Initializing the voice agent…
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-white/60">
                      Allow the microphone prompt when it appears—your call stays right inside this panel.
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
