"use client";

import { useCallback, useState, type ReactNode } from "react";
import { apiFetch } from "@/lib/http";
import { redirectTo } from "@/lib/clientNavigation";
import { getLandingPath } from "@/lib/authPaths";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";

const LOGOUT_EVENT_KEY = "__ob_logout";

type Variant = "solid" | "ghost";

type SignOutButtonProps = {
  className?: string;
  children?: ReactNode;
  variant?: Variant;
  fullWidth?: boolean;
  onBeforeSignOut?: () => void;
};

export default function SignOutButton({
  className = "",
  children = "Sign out",
  variant = "solid",
  fullWidth = false,
  onBeforeSignOut,
}: SignOutButtonProps) {
  const { markUnauthenticated } = useAuthSession();
  const [pending, setPending] = useState(false);

  const handleSignOut = useCallback(async () => {
    if (pending) return;
    onBeforeSignOut?.();
    setPending(true);
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
        cache: "no-store",
      });
    } catch (error) {
      console.error("signout_request_failed", { message: (error as Error)?.message });
    } finally {
      try {
        localStorage.setItem(LOGOUT_EVENT_KEY, String(Date.now()));
      } catch (storageError) {
        console.warn("signout_storage_failed", { message: (storageError as Error)?.message });
      }
      window.dispatchEvent(new CustomEvent("ob:auth:logout"));
      markUnauthenticated();
      redirectTo(getLandingPath());
      setPending(false);
    }
  }, [markUnauthenticated, onBeforeSignOut, pending]);

  const variantClasses =
    variant === "ghost"
      ? "border border-white/20 text-white/80 hover:text-white hover:border-white/40"
      : "bg-white text-black hover:bg-white/90";
  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type="button"
      onClick={() => {
        void handleSignOut();
      }}
      disabled={pending}
      className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses} ${widthClass} ${className}`.trim()}
    >
      {pending ? "Signing out…" : children}
    </button>
  );
}
