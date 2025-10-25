import Link from "next/link";
import Section from "@/components/marketing/Section";

export const metadata = {
  title: "Thank you",
  description: "Confirmation page after submitting a request to EarlyBird.",
};

export default function ThanksPage() {
  return (
    <div className="flex flex-col">
      <section className="px-5 pt-20 pb-12 sm:px-6 md:pt-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="stellar-pill">Thanks</span>
          <h1 className="mt-6 text-4xl font-semibold text-white md:text-5xl">We received your message.</h1>
          <p className="mt-6 text-base text-white/70 md:text-lg">
            A member of the EarlyBird team will get back to you shortly. In the meantime, explore the demo or review the docs below.
          </p>
        </div>
      </section>

      <Section className="pt-0">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          <Link
            href="/docs"
            className="stellar-grid-card bg-white/5 text-center text-sm font-semibold text-white transition hover:border-white/25"
          >
            Read the documentation
          </Link>
          <Link
            href="/pricing"
            className="stellar-grid-card bg-white/5 text-center text-sm font-semibold text-white transition hover:border-white/25"
          >
            Review pricing options
          </Link>
        </div>
      </Section>
    </div>
  );
}
