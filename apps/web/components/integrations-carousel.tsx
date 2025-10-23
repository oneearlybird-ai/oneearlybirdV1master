"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import Swiper, { Navigation } from "swiper";
import "swiper/swiper.min.css";

import Star from "@/public/images/star.svg";
import { crmIntegrations } from "@/lib/crmIntegrations";

Swiper.use([Navigation]);

export default function IntegrationsCarousel() {
  useEffect(() => {
    const swiper = new Swiper(".stellar-carousel", {
      breakpoints: {
        320: { slidesPerView: 1 },
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      },
      grabCursor: true,
      loop: false,
      centeredSlides: false,
      initialSlide: 0,
      spaceBetween: 24,
      navigation: {
        nextEl: ".carousel-next",
        prevEl: ".carousel-prev",
      },
    });

    return () => {
      swiper.destroy(true, true);
    };
  }, []);

  return (
    <>
      <div className="stellar-carousel swiper-container group">
        <div className="swiper-wrapper w-fit">
          {crmIntegrations.map((integration) => (
            <div
              key={integration.slug}
              className="swiper-slide h-auto rounded-3xl border border-slate-800 bg-linear-to-tr from-slate-800 to-slate-800/25 transition-colors hover:border-slate-700/60"
            >
              <div className="flex h-full flex-col p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="relative">
                    <Image src={integration.logo} width={44} height={44} alt={integration.name} />
                    <Image className="absolute -right-1 top-0" src={Star} width={16} height={16} alt="Star" aria-hidden="true" />
                  </div>
                  <div>
                    <Link
                      className="font-semibold bg-clip-text text-transparent bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 group-hover:before:absolute group-hover:before:inset-0"
                      href={`/integrations/${integration.slug}`}
                    >
                      {integration.name}
                    </Link>
                    <p className="text-xs uppercase tracking-[0.22rem] text-slate-500">Native CRM sync</p>
                  </div>
                </div>

                <p className="mb-4 text-sm text-slate-300">{integration.carouselDescription}</p>
                <ul className="space-y-2 text-sm text-slate-400">
                  {integration.carouselHighlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-2">
                      <span className="mt-1 inline-flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-500" aria-hidden />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex items-center justify-between text-sm">
                  <Link
                    className="inline-flex items-center gap-2 font-medium text-purple-300 transition-colors hover:text-purple-200"
                    href={`/integrations/${integration.slug}`}
                  >
                    <span>View integration</span>
                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                      <path d="M6.7 14.7l1.4-1.4L3.8 9H16V7H3.8l4.3-4.3-1.4-1.4L0 8z" />
                    </svg>
                  </Link>
                  <span className="text-xs uppercase tracking-[0.3rem] text-slate-600">{integration.installBase} teams</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <button className="carousel-prev relative z-20 flex h-12 w-12 items-center justify-center rounded-full border border-slate-700/60 bg-slate-800/40 transition hover:border-slate-600 hover:bg-slate-800/70">
          <span className="sr-only">Show previous CRM</span>
          <svg className="h-4 w-4 fill-current text-slate-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
            <path d="M6.7 14.7 5.3 13.3 9.6 9H-2V7H9.6L5.3 2.7 6.7 1.3 13.4 8z" transform="scale(-1,1) translate(-16,0)" />
          </svg>
        </button>
        <button className="carousel-next relative z-20 flex h-12 w-12 items-center justify-center rounded-full border border-slate-700/60 bg-slate-800/40 transition hover:border-slate-600 hover:bg-slate-800/70">
          <span className="sr-only">Show next CRM</span>
          <svg className="h-4 w-4 fill-current text-slate-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
            <path d="M6.7 14.7 8.1 13.3 3.8 9H16V7H3.8l4.3-4.3L6.7 1.3 0 8z" />
          </svg>
        </button>
      </div>
    </>
  );
}
