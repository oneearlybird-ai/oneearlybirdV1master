'use client'

import { useEffect } from "react";

import AOS from "aos";
import "aos/dist/aos.css";
import "./css/style.css";

import MarketingHeader from "@/components/marketing/Header";
import MarketingFooter from "@/components/marketing/Footer";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode
}) {  

  useEffect(() => {
    AOS.init({
      once: true,
      disable: 'phone',
      duration: 1000,
      easing: 'ease-out-cubic',
    })
  })

  return (
    <>
      <MarketingHeader />
      
      <main className="grow">

        {children}

      </main>

      <MarketingFooter />
    </>
  )
}
