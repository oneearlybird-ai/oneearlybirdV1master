export const dynamic = 'force-static';

export default function Docs() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white px-6 py-16">
      <section className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Developer Docs</h1>
        <p className="mt-4 text-white/70">
          API references and integration guides for EarlyBird.
        </p>

        <h2 className="mt-10 text-xl font-medium">Getting Started</h2>
        <p className="mt-3 text-white/80">
          Install the EarlyBird client, set up authentication, and begin routing calls through our API.
        </p>

        <h2 className="mt-10 text-xl font-medium">Authentication</h2>
        <p className="mt-3 text-white/80">
          All API requests require an API key. You can create and manage keys in the dashboard.
        </p>

        <h2 className="mt-10 text-xl font-medium">Endpoints</h2>
        <ul className="mt-3 list-disc pl-5 text-white/80 space-y-1">
          <li><code>POST /api/v1/calls</code> — create and route a new call</li>
          <li><code>GET /api/v1/calls/:id</code> — fetch call status and transcript</li>
          <li><code>POST /api/v1/customers</code> — create or update a customer profile</li>
        </ul>

        <h2 className="mt-10 text-xl font-medium">More</h2>
        <p className="mt-3 text-white/70">
          Visit our GitHub or contact support@earlybird.ai for advanced use cases and SDKs.
        </p>
      </section>
    </main>
  );
}
