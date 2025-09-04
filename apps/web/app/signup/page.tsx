import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-2 text-white/70">
          Start your free trial of EarlyBird today.
        </p>

        <form className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md bg-neutral-900 border border-white/20 px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              className="mt-1 block w-full rounded-md bg-neutral-900 border border-white/20 px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              required
              className="mt-1 block w-full rounded-md bg-neutral-900 border border-white/20 px-3 py-2 text-white"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-white text-black py-2 font-medium hover:bg-white/90"
          >
            Sign up
          </button>
        </form>

        <p className="mt-6 text-sm text-white/60">
          Already have an account?{" "}
          <Link href="/login" className="underline hover:text-white">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
