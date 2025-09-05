import Link from "next/link";

export const dynamic = "force-static";

export const metadata = {
  title: "Thanks — EarlyBird",
  description: "Your EarlyBird account was created successfully.",
  robots: { index: false, follow: false },
};

export default function ThanksPage() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70">
          ✅ Account created
        </div>

        <h1 className="mt-6 text-4xl md:text-5xl font-semibold tracking-tight">
          You&apos;re in. Let&apos;s get your assistant live.
        </h1>

        <p className="mt-4 text-white/70">
          We sent a confirmation to your email. It may take a minute to arrive.
          Once confirmed, you can finish setup and connect your phone number.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/login"
            className="rounded-xl bg-white px-5 py-3 font-medium text-black"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/docs"
            className="rounded-xl border border-white/20 px-5 py-3 text-white/80 hover:text-white"
          >
            Read the Docs
          </Link>
          <Link
            href="/support"
            className="rounded-xl border border-white/20 px-5 py-3 text-white/80 hover:text-white"
          >
            Contact Support
          </Link>
        </div>

        <div className="mt-10 grid gap-4 text-left text-sm text-white/60">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="font-medium text-white/80">Email didn&apos;t arrive?</div>
            <ul className="mt-2 list-disc pl-5">
              <li>Check spam and promotions folders.</li>
              <li>Whitelist <span className="text-white">noreply@oneearlybird.ai</span>.</li>
              <li>Wait 2–3 minutes; messages can be delayed.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="font-medium text-white/80">Next steps</div>
            <ul className="mt-2 list-disc pl-5">
              <li>Connect your number (Twilio/Plivo/Vonage) or request hosting.</li>
              <li>Set business hours, routing, and scheduling integration.</li>
              <li>Enable transcripts, analytics, and billing.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
