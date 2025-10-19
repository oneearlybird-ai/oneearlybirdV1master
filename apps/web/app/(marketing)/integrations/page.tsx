export const metadata = {
  title: "Integrations - EarlyBird AI",
  description: "Connect EarlyBird AI with the tools that run your business in minutes.",
};

import IntegrationsSection from './integrations-section'
import IntegrationsList from './integrations-list'

export default function Integrations() {
  return (
    <>
      <IntegrationsSection />
      <IntegrationsList />
    </>
  )
}
