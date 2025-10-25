import { redirect } from "next/navigation";
import { loadServerSession } from "@/lib/server/loadSession";
import { isTenantActive } from "@/lib/isTenantActive";

const ACCOUNT_CREATE_PATH = "/m/account/create";
const DASHBOARD_PATH = "/m/dashboard";

export default async function GoogleDoneMobilePage() {
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
