export const metadata = {
  title: "About - EarlyBird AI",
  description: "Learn how EarlyBird AI keeps your phones answered and customers delighted.",
};

import HeroAbout from '@/components/hero-about';
import Story from '@/components/story';
import Team from '@/components/team';
import Recruitment from '@/components/recruitment';
import Testimonials from '@/components/testimonials-02';
import Cta from '@/components/cta-02';

export default function About() {
  return (
    <>
      <HeroAbout />
      <Story />
      <Team />
      <Recruitment />
      <Testimonials />
      <Cta />
    </>
  );
}
