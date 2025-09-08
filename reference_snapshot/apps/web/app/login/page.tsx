import AuthClient from "./AuthClient";

export const dynamic = "force-dynamic";

type Providers = Record<string, { id: string; name: string }>;

export default async function Page({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const tab = (typeof searchParams?.tab === "string" && searchParams?.tab === "signup") ? "signup" : "login";

  const base = process.env.NEXTAUTH_URL || "";
  const url = base ? `${base}/api/auth/providers` : "/api/auth/providers";

  let providers: Providers = {};
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      providers = (await res.json()) as Providers;
    }
  } catch {
    // fallback no providers
  }

  return <AuthClient providers={providers} initialTab={tab as "login" | "signup"} />;
}
