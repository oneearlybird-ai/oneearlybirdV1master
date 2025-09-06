import { jsonFetch } from "@/lib/http";

export const dynamic = "force-dynamic";

export default async function HealthPage() {
  const res = await jsonFetch<{ ok: boolean; time?: string }>("/api/health", { cache: "no-store" });
  return (
    <main style={{ padding: 24 }}>
      <h2>Health</h2>
      <pre style={{ background: "#f7f7f7", padding: 12, borderRadius: 8 }}>{JSON.stringify(res, null, 2)}</pre>
    </main>
  );
}
