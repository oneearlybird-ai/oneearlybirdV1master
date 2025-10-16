"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";
import { getLandingPath } from "@/lib/authPaths";

function MobileDashboardSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 py-12 text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-white/60 animate-pulse">
        Loading dashboard…
      </div>
    </div>
  );
}

export default function MobileDashboardLayout({ children }: { children: ReactNode }) {
  const { status } = useAuthSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(getLandingPath());
    }
  }, [router, status]);

  if (status === "loading") {
    return <MobileDashboardSkeleton />;
  }

  if (status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}
