"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";
import { getAccountPendingPath, getAccountCreatePath, getLandingPath } from "@/lib/authPaths";

const LOGIN_EVENT_KEY = "__ob_login";

type FinalizeOptions = {
  needsAccountCreate?: boolean;
  redirectPath?: string;
  onSuccess?: () => void;
  mode?: "navigate" | "session-only";
};

export function useOAuthFinalizer() {
  const router = useRouter();
  const { refresh } = useAuthSession();

  return useCallback(
    async ({ redirectPath, onSuccess, needsAccountCreate, mode = "navigate" }: FinalizeOptions = {}) => {
      try {
        await refresh({ showLoading: true, retryOnUnauthorized: true });

        const destination =
          redirectPath ?? (needsAccountCreate ? getAccountCreatePath() : getAccountPendingPath());

        onSuccess?.();
        try {
          localStorage.setItem(LOGIN_EVENT_KEY, String(Date.now()));
        } catch (error) {
          console.warn("oauth_finalize_storage_failed", { message: (error as Error)?.message });
        }
        window.dispatchEvent(new CustomEvent("ob:auth:success"));
        if (mode === "navigate") {
          router.replace(destination);
        }
      } catch (error) {
        console.warn("oauth_finalize_failed", { message: (error as Error)?.message });
        if (mode === "navigate") {
          router.replace(getLandingPath());
        }
      }
    },
    [refresh, router],
  );
}
