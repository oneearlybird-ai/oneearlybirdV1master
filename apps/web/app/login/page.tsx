export const dynamic = 'force-dynamic';

export default function Login() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      <div className="mx-auto max-w-md px-6 py-16 md:py-24">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Log in</h1>
        <p className="mt-2 text-white/70">
          Demo-only form. Authentication will be wired up in a later batch.
        </p>

        <form className="mt-8 space-y-6" action="#" method="post">
          <div>
            <label className="text-sm text-white/70">Email</label>
            <input
              type="email"
              required
              className="mt-2 w-full rounded-md border border-white/20 bg-neutral-900 px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="text-sm text-white/70">Password</label>
            <input
              type="password"
              required
              className="mt-2 w-full rounded-md border border-white/20 bg-neutral-900 px-3 py-2 text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-white text-black py-2 font-medium hover:bg-white/90"
          >
            Log in
          </button>
        </form>

        <p className="mt-6 text-sm text-white/60">
          New here?{" "}
          <a href="/signup" className="underline hover:text-white">
            Create an account
          </a>
        </p>
      </div>
    </main>
  );
}
