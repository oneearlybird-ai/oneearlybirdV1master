"use client";

import Link from "next/link";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";
import SignOutButton from "@/components/auth/SignOutButton";
import { getDashboardPath } from "@/lib/authPaths";

type Variant = "desktop" | "mobile";

type Props = {
  variant?: Variant;
  onNavigate?: () => void;
};


function baseClasses(variant: Variant) {
  if (variant === "mobile") {
    return "flex w-full flex-col gap-3";
  }
  return "flex items-center gap-2";
}

export default function MarketingAuthControls({ variant = "desktop", onNavigate }: Props) {
  const { status } = useAuthSession();
  const { open } = useAuthModal();

  if (status === "loading") {
    return (
      <div className={baseClasses(variant)}>
        <span className={variant === "desktop" ? "text-sm text-white/70" : "w-full rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 text-center"}>
          Checking session…
        </span>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className={baseClasses(variant)}>
        <Link
          href={getDashboardPath()}
          onClick={onNavigate}
          className={
            variant === "desktop"
              ? "inline-flex items-center justify-center rounded-lg border border-white/20 px-3 py-1.5 text-sm font-medium text-white/80 transition hover:text-white hover:border-white/40"
              : "w-full inline-flex items-center justify-center rounded-xl border border-white/15 px-4 py-3 text-sm font-medium text-white/85 hover:text-white transition"
          }
        >
          Dashboard
        </Link>
        <SignOutButton
          variant="solid"
          className={
            variant === "desktop"
              ? "px-3 py-1.5"
              : "w-full px-4 py-3"
          }
          fullWidth={variant === "mobile"}
          onBeforeSignOut={onNavigate}
        />
      </div>
    );
  }

  return (
    <div className={baseClasses(variant)}>
      <button
        type="button"
        onClick={() => {
          open("signin");
          onNavigate?.();
        }}
        className={
          variant === "desktop"
            ? "inline-flex items-center justify-center rounded-lg border border-white/20 px-3 py-1.5 text-sm font-medium text-white/80 transition hover:text-white hover:border-white/40"
            : "w-full inline-flex items-center justify-center rounded-xl border border-white/20 px-4 py-3 text-sm font-medium text-white/80 transition hover:text-white hover:border-white/40"
        }
      >
        Sign in
      </button>
      <button
        type="button"
        onClick={() => {
          open("signup");
          onNavigate?.();
        }}
        className={
          variant === "desktop"
            ? "inline-flex items-center justify-center rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-black transition hover:bg-white/90"
            : "w-full inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
        }
      >
        Start trial
      </button>
    </div>
  );
}
