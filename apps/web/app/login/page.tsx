export default function LoginPage() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      <section className="mx-auto max-w-md px-6 py-20">
        <h1 className="text-3xl font-semibold tracking-tight">Log in</h1>
        <form className="mt-8 space-y-4">
          <div>
            <label className="block text-sm text-white/70">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-md bg-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-white/70">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-md bg-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              required
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
          Don’t have an account? <a href="/signup" className="underline">Sign up</a>
        </p>
      </section>
    </main>
  );
}
