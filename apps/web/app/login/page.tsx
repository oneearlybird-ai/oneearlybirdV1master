export default function LoginPage() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white px-6 py-16">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-semibold tracking-tight">Log in</h1>
        <p className="mt-2 text-white/70">
          Welcome back! Please log in to continue.
        </p>

        <form className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="mt-1 w-full rounded-md border border-white/20 bg-neutral-900 px-3 py-2 text-white"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="mt-1 w-full rounded-md border border-white/20 bg-neutral-900 px-3 py-2 text-white"
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
          Don’t have an account?{" "}
          <a href="/signup" className="underline hover:text-white">
            Sign up
          </a>
        </p>
      </div>
    </main>
  );
}
