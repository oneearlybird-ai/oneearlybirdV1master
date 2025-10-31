"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";
import { fetchCsrfToken, invalidateCsrfToken } from "@/lib/security";
import { apiFetch } from "@/lib/http";
import { getDashboardPath, getLandingPath } from "@/lib/authPaths";
import { redirectTo } from "@/lib/clientNavigation";

type FieldErrors = {
  firstName?: string;
  lastName?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
};

export function AccountCreateForm() {
  const { status, profile, refresh, markUnauthenticated } = useAuthSession();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.firstName) setFirstName(String(profile.firstName));
    if (profile?.lastName) setLastName(String(profile.lastName));
  }, [profile?.firstName, profile?.lastName]);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirectTo(`${getLandingPath()}?auth=signup`);
    }
  }, [status]);

  const passwordMismatch = useMemo(() => password.trim() !== "" && password !== confirmPassword, [password, confirmPassword]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (pending) return;
      const trimmedFirst = firstName.trim();
      const trimmedLast = lastName.trim();
      const trimmedUsername = username.trim();
      const trimmedPassword = password;
      const trimmedConfirm = confirmPassword;
      const fieldErrors: FieldErrors = {};
      if (!trimmedFirst) fieldErrors.firstName = "Enter your first name.";
      if (!trimmedLast) fieldErrors.lastName = "Enter your last name.";
      if (!trimmedPassword || trimmedPassword.length < 8) fieldErrors.password = "Password must be at least 8 characters.";
      if (trimmedPassword !== trimmedConfirm) fieldErrors.confirmPassword = "Passwords must match.";
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
        setSuccessMessage(null);
        return;
      }
      setPending(true);
      setErrors({});
      setSuccessMessage(null);
      try {
        const token = await fetchCsrfToken();
        // Backend is expected to accept this payload and persist identity + password in a single call.
        const response = await apiFetch("/auth/account/create", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(token ? { "x-csrf-token": token } : {}),
          },
          body: JSON.stringify({
            firstName: trimmedFirst,
            lastName: trimmedLast,
            username: trimmedUsername || undefined,
            password: trimmedPassword,
            confirmPassword: trimmedConfirm,
          }),
        });
        if (response.ok) {
          await refresh({ showLoading: true, retryOnUnauthorized: true });
          setSuccessMessage("Account details saved. Redirecting…");
          redirectTo(getDashboardPath());
          return;
        }
        if (response.status === 401) {
          markUnauthenticated();
          redirectTo(`${getLandingPath()}?auth=signup`);
          return;
        }
        const payload = await response.json().catch(() => ({}));
        const fieldPayload = (payload?.fields ?? {}) as Record<string, string>;
        const newErrors: FieldErrors = {};
        if (typeof fieldPayload.firstName === "string") newErrors.firstName = fieldPayload.firstName;
        if (typeof fieldPayload.lastName === "string") newErrors.lastName = fieldPayload.lastName;
        if (typeof fieldPayload.username === "string") newErrors.username = fieldPayload.username;
        if (typeof fieldPayload.password === "string") newErrors.password = fieldPayload.password;
        if (typeof fieldPayload.confirmPassword === "string") newErrors.confirmPassword = fieldPayload.confirmPassword;
        newErrors.general =
          typeof payload?.message === "string" ? payload.message : "We couldn’t save your details. Try again soon.";
        setErrors(newErrors);
      } catch (error) {
        console.error("account_create_failed", { message: (error as Error)?.message });
        setErrors({
          general: "We couldn’t reach the server. Check your connection and try again.",
        });
        invalidateCsrfToken();
      } finally {
        setPending(false);
      }
    },
    [confirmPassword, firstName, lastName, markUnauthenticated, password, pending, refresh, username],
  );

  if (status === "loading") {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-6 text-white">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white/60">Loading…</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col justify-center px-6 py-12 text-white">
      <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-10 shadow-2xl shadow-black/25 backdrop-blur">
        <div className="max-w-xl">
          <h1 className="text-3xl font-semibold tracking-tight">Set up your account</h1>
          <p className="mt-2 text-sm text-white/70">
            Confirm how we should address you and create a password for direct sign-ins.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">
              First name
              <input
                type="text"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className={`mt-1 w-full rounded-xl border ${errors.firstName ? "border-rose-400/60 bg-rose-600/10" : "border-white/15 bg-white/5"} px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-white/40 focus:bg-white/10`}
                autoComplete="given-name"
                required
              />
              {errors.firstName ? <span className="mt-1 block text-xs text-rose-300">{errors.firstName}</span> : null}
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">
              Last name
              <input
                type="text"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className={`mt-1 w-full rounded-xl border ${errors.lastName ? "border-rose-400/60 bg-rose-600/10" : "border-white/15 bg-white/5"} px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-white/40 focus:bg-white/10`}
                autoComplete="family-name"
                required
              />
              {errors.lastName ? <span className="mt-1 block text-xs text-rose-300">{errors.lastName}</span> : null}
            </label>
          </div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">
            Username (optional)
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className={`mt-1 w-full rounded-xl border ${errors.username ? "border-rose-400/60 bg-rose-600/10" : "border-white/15 bg-white/5"} px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-white/40 focus:bg-white/10`}
              maxLength={64}
            />
            {errors.username ? <span className="mt-1 block text-xs text-rose-300">{errors.username}</span> : null}
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`mt-1 w-full rounded-xl border ${errors.password ? "border-rose-400/60 bg-rose-600/10" : "border-white/15 bg-white/5"} px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-white/40 focus:bg-white/10`}
                autoComplete="new-password"
                required
                minLength={8}
              />
              {errors.password ? <span className="mt-1 block text-xs text-rose-300">{errors.password}</span> : null}
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">
              Confirm password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={`mt-1 w-full rounded-xl border ${errors.confirmPassword || passwordMismatch ? "border-rose-400/60 bg-rose-600/10" : "border-white/15 bg-white/5"} px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-white/40 focus:bg-white/10`}
                autoComplete="new-password"
                required
                minLength={8}
              />
              {errors.confirmPassword || passwordMismatch ? (
                <span className="mt-1 block text-xs text-rose-300">
                  {errors.confirmPassword ?? "Passwords must match."}
                </span>
              ) : null}
            </label>
          </div>
          {errors.general ? <p className="text-sm text-rose-300">{errors.general}</p> : null}
          {successMessage ? <p className="text-sm text-emerald-300">{successMessage}</p> : null}
          <button
            type="submit"
            disabled={pending || passwordMismatch}
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-60"
            aria-busy={pending}
          >
            {pending ? "Saving…" : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
