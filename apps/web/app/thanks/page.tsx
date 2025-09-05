import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Check your email – EarlyBird",
};

export default function Thanks() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      <section className="mx-auto max-w-lg px-6 py-16 md:py-24">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Check your email</h1>
        <p className="mt-2 text-white/70">
          If an account exists for that address, we sent a link to continue.
        </p>
        <Link href="/" className="mt-6 inline-block rounded-xl border border-white/20 px-4 py-2 text-sm text-white/80 hover:text-white">
          Back to home
        </Link>
      </section>
    </main>
  );
}
