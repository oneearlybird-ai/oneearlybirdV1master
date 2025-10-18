import AuthClient from "./AuthClient";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const tab = (typeof searchParams?.tab === "string" && searchParams?.tab === "signup") ? "signup" : "login";
  return <AuthClient initialTab={tab as "login" | "signup"} />;
}
