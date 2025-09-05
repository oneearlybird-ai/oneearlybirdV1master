import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create account – EarlyBird",
};

export default function Signup() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      <section className="mx-auto max-w-lg px-6 py-16 md:py-24">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-2 text-white/70">Start with your business email.</p>

        <form method="post" action="/thanks" className="mt-8 space-y-4">
          <input name="email" type="email" required placeholder="you@business.com"
                 className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 outline-none placeholder-white/40" />
          <button type="submit"
                  className="w-full rounded-xl bg-white px-4 py-3 font-medium text-black hover:bg-white/90">
            Get started
          </button>
        </form>

        <p className="mt-4 text-sm text-white/60">
          Already have an account? <Link href="/login" className="text-white hover:underline">Log in</Link>
        </p>
      </section>
    </main>
  );
}
