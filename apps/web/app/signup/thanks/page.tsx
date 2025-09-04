import Link from "next/link";

export const metadata = {
  title: "Thanks — EarlyBird",
  description: "You're on the list. We'll send your setup link shortly.",
};

export default function ThanksPage() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">You’re on the list ✅</h1>
        <p className="mt-4 max-w-2xl text-white/70">
          We received your info. A setup link will arrive shortly.
        </p>
        <div className="mt-8">
          <Link href="/" className="rounded-lg border border-white/20 px-4 py-2">
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
