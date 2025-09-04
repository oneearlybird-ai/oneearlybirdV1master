export const dynamic = 'force-dynamic';

export default function Signup() {
  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-white">
      <h1 className="text-3xl font-semibold tracking-tight">Create your account</h1>
      <p className="mt-3 text-white/70">
        Start your 14-day free trial. No credit card required.
      </p>

      <form className="mt-8 grid gap-4" action="#" method="post">
        <input
          type="text"
          name="name"
          placeholder="Full name"
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white/80 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Work email"
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white/80 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white/80 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
          minLength={8}
          required
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-white px-5 py-3 font-medium text-black hover:bg-white/90"
        >
          Create account
        </button>
      </form>

      <p className="mt-4 text-sm text-white/60">
        Already have an account? <a href="/login" className="underline hover:text-white">Log in</a>
      </p>
    </main>
  );
}
