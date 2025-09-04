export const dynamic = 'force-dynamic';

export default function Login() {
  return (
    <main className="mx-auto max-w-md px-6 py-24">
      <h1 className="text-3xl font-semibold tracking-tight">Log in</h1>

      <form className="mt-8 grid gap-4">
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
          Log in
        </button>
      </form>

      <p className="mt-4 text-sm text-white/60">
        New to EarlyBird? <a href="/signup" className="underline hover:text-white">Create an account</a>
      </p>
    </main>
  );
}
