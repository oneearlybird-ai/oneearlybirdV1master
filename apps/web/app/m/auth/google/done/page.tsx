import { redirect } from "next/navigation";
import { loadServerSession } from "@/lib/server/loadSession";
import { isTenantActive } from "@/lib/isTenantActive";

const ACCOUNT_CREATE_PATH = "/m/account/create";
const DASHBOARD_PATH = "/m/dashboard";

type GoogleDoneMobilePageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function GoogleDoneMobilePage({ searchParams }: GoogleDoneMobilePageProps) {
  const redirectParam = coerceRelativeMobilePath(searchParams?.redirect);
  const needsAccountCreate = toBoolean(searchParams?.needsAccountCreate);

  if (redirectParam) redirect(redirectParam);
  if (needsAccountCreate) redirect(ACCOUNT_CREATE_PATH);

  const { status, profile } = await loadServerSession();

  if (status === "authenticated") {
    if (profile?.needsAccountCreate) redirect(ACCOUNT_CREATE_PATH);
    if (isTenantActive(profile)) redirect(DASHBOARD_PATH);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#05050b] px-6 text-center text-white">
      <h1 className="text-xl font-semibold text-white">Sign-in incomplete</h1>
      <p className="max-w-sm text-sm text-white/70">Your session was not detected. Please try signing in again.</p>
      <a className="text-sm font-semibold text-sky-400 underline-offset-4 hover:underline" href="/m/login">
        Return to login
      </a>
    </main>
  );
}

function coerceRelativeMobilePath(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  if (!raw.startsWith("/")) return null;
  if (raw.startsWith("//")) return null;
  return raw.startsWith("/m/") ? raw : null;
}

function toBoolean(value: string | string[] | undefined): boolean {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return false;
  const normalised = raw.trim().toLowerCase();
  return normalised === "1" || normalised === "true" || normalised === "yes";
}
