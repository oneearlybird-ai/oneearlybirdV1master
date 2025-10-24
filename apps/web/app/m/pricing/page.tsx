export const metadata = {
  title: "Pricing - EarlyBird AI",
  description: "Choose the call volume that fits your team and add seats as you grow.",
};

import PricingSection from './pricing-section'
import Faqs from '@/components/faqs'
import Cta from '@/components/cta'

export default function Pricing() {
  return (
    <>
      <PricingSection />
      <Faqs />
      <Cta />
    </>
  )
}
