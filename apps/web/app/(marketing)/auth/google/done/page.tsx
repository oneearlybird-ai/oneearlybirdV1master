import { redirect } from "next/navigation";
import { OAuthFinalizeEffect } from "@/components/auth/OAuthFinalizeEffect";
import { loadServerSession } from "@/lib/server/loadSession";
import { isTenantActive } from "@/lib/isTenantActive";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

const ACCOUNT_CREATE_PATH = "/account/create";
const DASHBOARD_PATH = "/dashboard";

function normaliseRedirectParam(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  const candidate = Array.isArray(value) ? value[0] : value;
  if (typeof candidate !== "string") return undefined;
  if (!candidate.startsWith("/")) return undefined;
  if (candidate.startsWith("//")) return undefined;
  return candidate;
}

function parseBooleanFlag(value: string | string[] | undefined): boolean {
  if (!value) return false;
  const candidate = Array.isArray(value) ? value[0] : value;
  if (typeof candidate !== "string") return false;
  return candidate === "1" || candidate.toLowerCase() === "true";
}

export default async function GoogleOauthDonePage({ searchParams }: PageProps) {
  const redirectParam = normaliseRedirectParam(searchParams?.redirect);
  const queryNeedsAccountCreate = parseBooleanFlag(searchParams?.needsAccountCreate);

  const session = await loadServerSession();

  if (session.status === "authenticated") {
    if (session.profile?.needsAccountCreate) {
      redirect(ACCOUNT_CREATE_PATH);
    }
    if (isTenantActive(session.profile)) {
      redirect(DASHBOARD_PATH);
    }
    if (redirectParam) {
      redirect(redirectParam);
    }
  }

  const finalizeNeedsAccountCreate = session.profile?.needsAccountCreate === true || queryNeedsAccountCreate;

  return (
    <>
      <OAuthFinalizeEffect redirectPath={redirectParam} needsAccountCreate={finalizeNeedsAccountCreate} />
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#05050b] px-6 text-center text-white">
        <div className="max-w-sm rounded-2xl border border-white/10 bg-white/5 px-6 py-8 shadow-2xl">
          <h1 className="text-lg font-semibold text-white">Finishing sign-in…</h1>
          <p className="mt-3 text-sm text-white/70">Please wait while we update your session.</p>
        </div>
      </main>
    </>
  );
}
