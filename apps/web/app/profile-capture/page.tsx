"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { redirectTo } from "@/lib/clientNavigation";
import { getDashboardPath, getProfileCapturePath } from "@/lib/authPaths";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";
import { fetchCsrfToken, invalidateCsrfToken } from "@/lib/security";
import { apiFetch } from "@/lib/http";
import { formatE164Input } from "@/lib/format";
import { hasCompletedName } from "@/lib/profile";

type FieldErrors = Record<string, string>;

export default function ProfileCapturePage() {
  const router = useRouter();
  const { status, profile, refresh } = useAuthSession();
  const [firstName, setFirstName] = useState(() => (profile?.firstName ?? "").toString());
  const [lastName, setLastName] = useState(() => (profile?.lastName ?? "").toString());
  const [displayName, setDisplayName] = useState(() => (profile?.displayName ?? "").toString());
  const [phone, setPhone] = useState(() => (profile?.contactPhone ?? "").toString());
  const [marketingOptIn, setMarketingOptIn] = useState<boolean>(() => (profile?.marketingOptIn ?? false) === true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    setFirstName((profile?.firstName ?? "").toString());
    setLastName((profile?.lastName ?? "").toString());
    setDisplayName((profile?.displayName ?? "").toString());
    setPhone((profile?.contactPhone ?? "").toString());
    setMarketingOptIn((profile?.marketingOptIn ?? false) === true);
  }, [profile?.contactPhone, profile?.displayName, profile?.firstName, profile?.lastName, profile?.marketingOptIn]);

  const profileComplete = useMemo(() => hasCompletedName(profile), [profile]);

  useEffect(() => {
    if (status === "unauthenticated") {
      const targetPath = getProfileCapturePath();
      const loginPath = targetPath.startsWith("/m") ? "/m/login" : "/login";
      router.replace(`${loginPath}?next=${encodeURIComponent(targetPath)}`);
    }
  }, [router, status]);

  useEffect(() => {
    if (status === "authenticated" && profileComplete) {
      redirectTo(getDashboardPath());
    }
  }, [profileComplete, status]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (pending) return;
      setError(null);
      setFieldErrors({});

      const trimmedFirst = firstName.trim();
      const trimmedLast = lastName.trim();
      if (!trimmedFirst || !trimmedLast) {
        const errs: FieldErrors = {};
        if (!trimmedFirst) errs.firstName = "Enter your first name.";
        if (!trimmedLast) errs.lastName = "Enter your last name.";
        setFieldErrors(errs);
        setError("Complete the required fields to continue.");
        return;
      }

      const payload: Record<string, unknown> = {
        firstName: trimmedFirst,
        lastName: trimmedLast,
        marketingOptIn: Boolean(marketingOptIn),
      };
      if (displayName.trim()) {
        payload.displayName = displayName.trim();
      }
      const phoneValue = phone.trim();
      if (phoneValue.length > 0) {
        payload.contactPhone = formatE164Input(phoneValue);
      } else {
        payload.contactPhone = null;
      }

      setPending(true);
      try {
        const token = await fetchCsrfToken();
        const response = await apiFetch("/profile/setup", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(token ? { "x-csrf-token": token } : {}),
          },
          body: JSON.stringify(payload),
        });
        if (response.status === 200) {
          await refresh({ showLoading: true, retryOnUnauthorized: true });
          redirectTo(getDashboardPath());
          return;
        }
        if (response.status === 400) {
          const json = (await response.json().catch(() => ({}))) as { fields?: FieldErrors; message?: string };
          if (json?.fields) {
            setFieldErrors(json.fields);
            setError("Fix the highlighted fields to continue.");
          } else {
            setError(json?.message ?? "We couldn’t save your details. Try again.");
          }
          return;
        }
        if (response.status === 403) {
          setError("We need additional verification before continuing.");
          return;
        }
        setError("We couldn’t save your details. Try again soon.");
      } catch (err) {
        console.error("profile_capture_save_failed", err);
        setError("We couldn’t reach the server. Check your connection and try again.");
        invalidateCsrfToken();
      } finally {
        setPending(false);
      }
    },
    [displayName, firstName, lastName, marketingOptIn, pending, phone, refresh],
  );

  if (status === "loading") {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl flex-col items-center justify-center px-6 text-white">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white/60">Loading your profile…</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl flex-col justify-center px-6 py-12 text-white">
      <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-10 shadow-2xl shadow-black/25 backdrop-blur">
        <div className="max-w-xl">
          <h1 className="text-3xl font-semibold tracking-tight">Let’s tailor EarlyBird for you</h1>
          <p className="mt-2 text-sm text-white/70">Confirm your details so we can personalize greetings, notifications, and onboarding.</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">
              First name
              <input
                type="text"
                value={firstName}
                onChange={(event) => {
                  setFirstName(event.target.value);
                  setFieldErrors((prev) => {
                    if (!prev.firstName) return prev;
                    const { firstName: _removed, ...rest } = prev;
                    return rest;
                  });
                }}
                className={`mt-1 w-full rounded-xl border ${fieldErrors.firstName ? "border-rose-400/60 bg-rose-600/10" : "border-white/15 bg-white/5"} px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-white/40 focus:bg-white/10`}
                autoComplete="given-name"
                maxLength={100}
                required
              />
              {fieldErrors.firstName ? <span className="mt-1 block text-xs text-rose-300">{fieldErrors.firstName}</span> : null}
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">
              Last name
              <input
                type="text"
                value={lastName}
                onChange={(event) => {
                  setLastName(event.target.value);
                  setFieldErrors((prev) => {
                    if (!prev.lastName) return prev;
                    const { lastName: _removed, ...rest } = prev;
                    return rest;
                  });
                }}
                className={`mt-1 w-full rounded-xl border ${fieldErrors.lastName ? "border-rose-400/60 bg-rose-600/10" : "border-white/15 bg-white/5"} px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-white/40 focus:bg-white/10`}
                autoComplete="family-name"
                maxLength={100}
                required
              />
              {fieldErrors.lastName ? <span className="mt-1 block text-xs text-rose-300">{fieldErrors.lastName}</span> : null}
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wide text-white/60 md:col-span-2">
              Display name (optional)
              <input
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-white/40 focus:bg-white/10"
                maxLength={120}
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">
              Phone number (optional)
              <input
                type="tel"
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  setFieldErrors((prev) => {
                    if (!prev.contactPhone) return prev;
                    const { contactPhone: _removed, ...rest } = prev;
                    return rest;
                  });
                }}
                placeholder="+1XXXXXXXXXX"
                autoComplete="tel"
                className={`mt-1 w-full rounded-xl border ${fieldErrors.contactPhone ? "border-rose-400/60 bg-rose-600/10" : "border-white/15 bg-white/5"} px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-white/40 focus:bg-white/10`}
              />
              {fieldErrors.contactPhone ? <span className="mt-1 block text-xs text-rose-300">{fieldErrors.contactPhone}</span> : null}
            </label>
            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <input
                id="marketing-opt-in"
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 rounded border border-white/30 bg-black/20 text-white accent-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                checked={marketingOptIn}
                onChange={(event) => setMarketingOptIn(event.target.checked)}
              />
              <label htmlFor="marketing-opt-in" className="text-sm text-white/80">
                Receive product updates and marketing tips from EarlyBird
              </label>
            </div>
          </div>
          {error ? (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}
          <div className="flex flex-wrap justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => redirectTo("/logout")}
              className="text-sm text-white/60 underline-offset-2 transition hover:text-white hover:underline"
            >
              Switch account
            </button>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pending ? "Saving…" : "Continue to dashboard"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
