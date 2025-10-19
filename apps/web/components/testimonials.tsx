'use client'

import { useState, useRef, useEffect } from 'react'
import Image, { StaticImageData } from 'next/image'
import { Transition } from '@headlessui/react'
import Particles from './particles'

import TestimonialImg01 from '@/public/images/testimonial-01.jpg'
import TestimonialImg02 from '@/public/images/testimonial-02.jpg'
import TestimonialImg03 from '@/public/images/testimonial-03.jpg'

interface Item {
  img: StaticImageData
  quote: string
  name: string
  role: string
}

export default function Testimonials() {

  const [active, setActive] = useState<number>(0)
  const [autorotate, setAutorotate] = useState<boolean>(true)
  const [autorotateTiming] = useState<number>(7000)

  const items: Item[] = [
    {
      img: TestimonialImg01,
      quote: "EarlyBird handled 180 after-hours calls last month and booked 42 maintenance visits before our techs even clocked in. Customers think they’re speaking with our dispatcher.",
      name: 'Sonia Patel',
      role: 'Operations Lead · BrightRoute HVAC'
    },
    {
      img: TestimonialImg02,
      quote: "Every transcript, recording, and booking lands in HubSpot instantly. Reps jump into warm conversations instead of chasing missed voicemails.",
      name: 'Leo Martinez',
      role: 'Revenue Operations · Harbor Clinics'
    },
    {
      img: TestimonialImg03,
      quote: "Weekend emergencies used to roll to voicemail and we’d lose that revenue to competitors. EarlyBird keeps callers on the line, books the job, and sends our techs a recap so nothing slips.",
      name: 'Maya Chen',
      role: 'COO · RapidRestore Plumbing'
    }
  ]

  const testimonials = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!autorotate) return
    const timeout = setTimeout(() => {
      setActive((prev) => (prev + 1) % items.length)
    }, autorotateTiming)
    return () => clearTimeout(timeout)
  }, [active, autorotate, autorotateTiming, items.length])

  const heightFix = () => {
    if (testimonials.current && testimonials.current.parentElement) testimonials.current.parentElement.style.height = `${testimonials.current.clientHeight}px`
  }

  useEffect(() => {
    heightFix()
  }, [])  

  return (
    <section>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="relative pb-12 md:pb-20">

          {/* Particles animation */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 -z-10 w-80 h-80 -mt-6">
            <Particles className="absolute inset-0 -z-10" quantity={10} staticity={40} /> 
          </div>

          {/* Carousel */}
          <div className="text-center">
            {/* Testimonial image */}
            <div className="relative h-32 [mask-image:linear-gradient(0deg,transparent,var(--color-white)_40%,var(--color-white))]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[480px] h-[480px] -z-10 pointer-events-none before:rounded-full rounded-full before:absolute before:inset-0 before:bg-linear-to-b before:from-slate-400/20 before:to-transparent before:to-20% after:rounded-full after:absolute after:inset-0 after:bg-slate-900 after:m-px before:-z-20 after:-z-20">

                {items.map((item, index) => (
                  <Transition
                    key={index}
                    as="div"
                    show={active === index}
                    className={`absolute inset-0 h-full -z-10 transform transition ease-[cubic-bezier(0.68,-0.3,0.32,1)] data-closed:absolute data-enter:data-closed:-rotate-[60deg] data-leave:data-closed:rotate-[60deg] data-closed:opacity-0 data-enter:duration-700 data-leave:duration-300`}
                    unmount={false}
                    appear={true}
                  >                  
                    <Image className="relative top-11 left-1/2 -translate-x-1/2 rounded-full" src={item.img} width={56} height={56} alt={item.name} />
                  </Transition>
                ))}

              </div>
            </div>
            {/* Text */}
            <div className="mb-10 transition-all duration-150 delay-300 ease-in-out">
              <div className="relative flex flex-col" ref={testimonials}>

                {items.map((item, index) => (
                  <Transition
                    key={index}
                    as="div"
                    show={active === index}
                    className={`transform transition ease-out data-closed:absolute data-enter:data-closed:-translate-x-4 data-leave:data-closed:translate-x-4 data-closed:opacity-0 data-enter:duration-500 data-enter:delay-200 data-leave:duration-300 data-leave:delay-200`}
                    unmount={false}
                    appear={true}
                  >
                    <div className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60">{item.quote}</div>
                  </Transition>
                ))}

              </div>
            </div>
            {/* Buttons */}
            <div className="flex flex-wrap justify-center -m-1.5">

              {items.map((item, index) => (
                <button className={`btn-sm m-1.5 text-xs py-1.5 text-slate-300 transition duration-150 ease-in-out [background:linear-gradient(var(--color-slate-900),var(--color-slate-900))_padding-box,conic-gradient(var(--color-slate-400),var(--color-slate-700)_25%,var(--color-slate-700)_75%,var(--color-slate-400)_100%)_border-box] relative before:absolute before:inset-0 before:bg-slate-800/30 before:rounded-full before:pointer-events-none ${active === index ? 'opacity-100' : 'opacity-30 hover:opacity-60'}`} key={index} onClick={() => { setActive(index); setAutorotate(false); }}>
                  <span className="relative">
                    <span className="text-slate-50">{item.name}</span> <span className="text-slate-600">-</span> <span>{item.role}</span>
                  </span>
                </button>
              ))}

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
