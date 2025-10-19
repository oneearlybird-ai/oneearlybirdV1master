export const metadata = {
  title: "Home - EarlyBird AI",
  description: "Turn missed calls into booked revenue with an AI receptionist that sounds human.",
};

import Hero from '@/components/hero'
import Clients from '@/components/clients'
import Features from '@/components/features'
import Features02 from '@/components/features-02'
import Features03 from '@/components/features-03'
import ReviewCarouselSection from '@/components/review-carousel-section'
import Features04 from '@/components/features-04'
import Pricing from './pricing-section'
import Testimonials from '@/components/testimonials'
import Cta from '@/components/cta'

export default function Home() {
  return (
    <>
      <Hero />
      <Clients />
      <Features />
      <Features02 />
      <Features03 />
      <ReviewCarouselSection />
      <Features04 />
      <Pricing />
      <Testimonials />
      <Cta />
    </>
  )
}
