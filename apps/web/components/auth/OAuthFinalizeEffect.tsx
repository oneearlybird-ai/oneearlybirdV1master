"use client";

import { useEffect } from "react";
import { consumeActiveAuthFlow } from "@/lib/authFlow";
import { resolvePopupMessage } from "@/lib/popup";
import { useOAuthFinalizer } from "@/hooks/useOAuthFinalizer";

type OAuthFinalizeEffectProps = {
  redirectPath?: string;
  needsAccountCreate?: boolean;
};

export function OAuthFinalizeEffect({ redirectPath, needsAccountCreate }: OAuthFinalizeEffectProps) {
  const finalizeOAuth = useOAuthFinalizer();

  useEffect(() => {
    consumeActiveAuthFlow();
    resolvePopupMessage("oauthResult");
    void finalizeOAuth({
      redirectPath,
      needsAccountCreate,
      mode: "session-only",
    });
  }, [finalizeOAuth, needsAccountCreate, redirectPath]);

  return null;
}
