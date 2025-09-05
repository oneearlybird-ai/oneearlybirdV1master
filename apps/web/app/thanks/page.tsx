export const dynamic = "force-static";
export const metadata = {
  title: "Thanks – EarlyBird",
  robots: { index: false, follow: false },
};

export default function ThanksPage() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Thanks — you’re in.</h1>
        <p className="mt-5 text-white/70">
          We’ve received your submission. Check your email for next steps.
        </p>
        <div className="mt-8">
          <a href="/" className="rounded-xl bg-white px-5 py-3 font-medium text-black">
            Back to Home
          </a>
        </div>
      </section>
    </main>
  );
}
