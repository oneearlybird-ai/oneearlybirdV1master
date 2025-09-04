export default function Signup() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-3xl font-semibold tracking-tight">Create your EarlyBird account</h1>
      <form className="mt-8 space-y-6">
        <input
          type="email"
          placeholder="Email address"
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white/80 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white/80 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-white px-5 py-3 font-medium text-black hover:bg-white/90"
        >
          Sign up
        </button>
      </form>
      <p className="mt-4 text-sm text-white/60">
        Already have an account? <a href="/login" className="underline hover:text-white">Log in</a>
      </p>
    </main>
  );
}
