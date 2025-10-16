"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";
import { apiFetch } from "@/lib/http";
import { fetchCsrfToken } from "@/lib/security";
import { formatAddressLine, formatDisplayPhone, formatE164Input } from "@/lib/format";
import StepUpDialog from "@/components/business/StepUpDialog";
import BusinessSetupWizard from "@/components/business/BusinessSetupWizard";
import { toast } from "@/components/Toasts";

type AccountFormState = {
  firstName: string;
  lastName: string;
  displayName: string;
  contactEmail: string;
  contactPhone: string;
};

type SettingsContentProps = {
  variant?: "desktop" | "mobile";
};

export default function SettingsContent({ variant = "desktop" }: SettingsContentProps) {
  const { profile, refresh } = useAuthSession();
  const [tab, setTab] = useState<"account" | "security" | "business">("account");
  const accountDefaults = useMemo<AccountFormState>(
    () => ({
      firstName: (profile?.firstName ?? "").toString(),
      lastName: (profile?.lastName ?? "").toString(),
      displayName: (profile?.displayName ?? "").toString(),
      contactEmail: (profile?.contactEmail ?? profile?.email ?? "").toString(),
      contactPhone: (profile?.contactPhone ?? "").toString(),
    }),
    [profile?.contactEmail, profile?.contactPhone, profile?.displayName, profile?.email, profile?.firstName, profile?.lastName],
  );
  const [accountForm, setAccountForm] = useState<AccountFormState>(accountDefaults);
  useEffect(() => {
    setAccountForm(accountDefaults);
  }, [accountDefaults]);

  const [accountPending, setAccountPending] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [accountFieldErrors, setAccountFieldErrors] = useState<Record<string, string>>({});
  const [stepUpOpen, setStepUpOpen] = useState(false);
  const [queuedPayload, setQueuedPayload] = useState<Record<string, unknown> | null>(null);

  const submitAccount = useCallback(
    async (payload: Record<string, unknown>, retry = false) => {
      setAccountPending(true);
      setAccountError(null);
      setAccountFieldErrors({});
      try {
        const token = await fetchCsrfToken();
        const res = await apiFetch("/profile/setup", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-csrf-token": token,
          },
          body: JSON.stringify(payload),
        });
        if (res.status === 200) {
          toast("Account details saved", "success");
          setQueuedPayload(null);
          setStepUpOpen(false);
          await refresh({ showLoading: true });
          return;
        }
        if (res.status === 403) {
          const json = (await res.json().catch(() => ({}))) as { code?: string };
          if (json?.code === "step_up_required" && !retry) {
            setQueuedPayload(payload);
            setStepUpOpen(true);
            return;
          }
          setAccountError("Additional verification required. Try again.");
          return;
        }
        if (res.status === 400) {
          const json = (await res.json().catch(() => ({}))) as { code?: string; fields?: Record<string, string> };
          if (json?.code === "validation_error" && json.fields) {
            setAccountFieldErrors(json.fields);
            setAccountError("Fix the highlighted fields to continue.");
          } else {
            setAccountError("We could not save your changes. Try again.");
          }
          return;
        }
        setAccountError("Something went wrong while saving. Try again soon.");
      } catch (err) {
        console.error(err);
        setAccountError("We could not reach the server. Check your connection and try again.");
      } finally {
        setAccountPending(false);
      }
    },
    [refresh],
  );

  const handleAccountSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload: Record<string, unknown> = {
      firstName: accountForm.firstName.trim(),
      lastName: accountForm.lastName.trim(),
      displayName: accountForm.displayName.trim(),
    };
    const email = accountForm.contactEmail.trim();
    payload.contactEmail = email.length > 0 ? email : null;
    const phone = accountForm.contactPhone.trim();
    payload.contactPhone = phone.length > 0 ? formatE164Input(phone) : null;
    await submitAccount(payload);
  };

  const [businessWizardOpen, setBusinessWizardOpen] = useState(false);
  const businessSeed = useMemo(() => {
    if (!profile) return null;
    return {
      businessName: profile.businessName ?? undefined,
      phoneE164: profile.businessPhone ?? undefined,
      timezone: profile.timezone ?? undefined,
      addressNormalized: profile.addressNormalized ?? undefined,
      hours: profile.hours ?? undefined,
      industry: profile.industry ?? undefined,
      crm: profile.crm ?? undefined,
      locations: profile.locations ?? undefined,
      website: profile.website ?? undefined,
    };
  }, [profile]);

  const businessNeedsSetup = useMemo(() => {
    if (!profile) return false;
    if (profile.businessProfileComplete === true) return false;
    if (profile.businessProfileComplete === false) return true;
    return !profile.businessName || !profile.addressNormalized;
  }, [profile]);

  const addressDisplay = useMemo(() => formatAddressLine(profile?.addressNormalized), [profile?.addressNormalized]);

  const tabs: Array<{ id: "account" | "security" | "business"; label: string }> = [
    { id: "account", label: "Account" },
    { id: "security", label: "Security" },
    { id: "business", label: "Business" },
  ];

  const containerClass = variant === "mobile" ? "mx-auto max-w-3xl px-4 py-8 text-white" : "mx-auto max-w-4xl px-6 py-10 text-white";

  return (
    <div className={containerClass}>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-white/60">Manage your personal details, security, and business profile.</p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <div role="tablist" aria-label="Settings sections" className="inline-flex rounded-full border border-white/15 bg-white/5 p-1 text-sm text-white/70">
          {tabs.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`rounded-full px-4 py-2 transition ${active ? "bg-white text-black" : "hover:text-white"}`}
                onClick={() => setTab(item.id)}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        {tab === "account" ? (
          <form onSubmit={handleAccountSubmit} className="space-y-4 max-w-2xl">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-xs font-medium uppercase tracking-wide text-white/60">
                First name
                <input
                  type="text"
                  value={accountForm.firstName}
                  onChange={(event) => setAccountForm((prev) => ({ ...prev, firstName: event.target.value }))}
                  className={`mt-1 w-full rounded-xl border ${accountFieldErrors.firstName ? "border-rose-400/60" : "border-white/15"} bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-white/40 focus:bg-white/10`}
                />
                {accountFieldErrors.firstName ? <span className="mt-1 block text-xs text-rose-300">{accountFieldErrors.firstName}</span> : null}
              </label>
              <label className="block text-xs font-medium uppercase tracking-wide text-white/60">
                Last name
                <input
                  type="text"
                  value={accountForm.lastName}
                  onChange={(event) => setAccountForm((prev) => ({ ...prev, lastName: event.target.value }))}
                  className={`mt-1 w-full rounded-xl border ${accountFieldErrors.lastName ? "border-rose-400/60" : "border-white/15"} bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-white/40 focus:bg-white/10`}
                />
                {accountFieldErrors.lastName ? <span className="mt-1 block text-xs text-rose-300">{accountFieldErrors.lastName}</span> : null}
              </label>
            </div>

            <label className="block text-xs font-medium uppercase tracking-wide text-white/60">
              Display name
              <input
                type="text"
                value={accountForm.displayName}
                onChange={(event) => setAccountForm((prev) => ({ ...prev, displayName: event.target.value }))}
                className={`mt-1 w-full rounded-xl border ${accountFieldErrors.displayName ? "border-rose-400/60" : "border-white/15"} bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-white/40 focus:bg-white/10`}
              />
              {accountFieldErrors.displayName ? <span className="mt-1 block text-xs text-rose-300">{accountFieldErrors.displayName}</span> : null}
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-xs font-medium uppercase tracking-wide text-white/60">
                Contact email
                <input
                  type="email"
                  value={accountForm.contactEmail}
                  onChange={(event) => setAccountForm((prev) => ({ ...prev, contactEmail: event.target.value }))}
                  className={`mt-1 w-full rounded-xl border ${accountFieldErrors.contactEmail ? "border-rose-400/60" : "border-white/15"} bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-white/40 focus:bg-white/10`}
                />
                {accountFieldErrors.contactEmail ? <span className="mt-1 block text-xs text-rose-300">{accountFieldErrors.contactEmail}</span> : null}
              </label>
              <label className="block text-xs font-medium uppercase tracking-wide text-white/60">
                Contact phone (E.164)
                <input
                  type="tel"
                  value={accountForm.contactPhone}
                  onChange={(event) => setAccountForm((prev) => ({ ...prev, contactPhone: event.target.value }))}
                  className={`mt-1 w-full rounded-xl border ${accountFieldErrors.contactPhone ? "border-rose-400/60" : "border-white/15"} bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-white/40 focus:bg-white/10`}
                  placeholder="+1XXXXXXXXXX"
                />
                <span className="mt-1 block text-xs text-white/40">{formatDisplayPhone(accountForm.contactPhone)}</span>
                {accountFieldErrors.contactPhone ? <span className="mt-1 block text-xs text-rose-300">{accountFieldErrors.contactPhone}</span> : null}
              </label>
            </div>

            {accountError ? <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{accountError}</div> : null}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={accountPending}
                className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-60"
              >
                {accountPending ? "Saving…" : "Save changes"}
              </button>
              <button
                type="button"
                onClick={() => setAccountForm(accountDefaults)}
                disabled={accountPending}
                className="rounded-xl border border-white/20 px-4 py-2.5 text-sm text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:opacity-50"
              >
                Reset
              </button>
            </div>
          </form>
        ) : null}

        {tab === "security" ? (
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
            <h2 className="text-lg font-semibold text-white">Security controls</h2>
            <p>Change email, password, and multi-factor authentication will live here. We’ll prompt for verification before enabling any of these options.</p>
            <p className="text-white/50">Security updates are coming soon. In the meantime, contact support if you need to update credentials.</p>
          </div>
        ) : null}

        {tab === "business" ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Business profile</h2>
                  <p className="text-sm text-white/60">Used for caller greetings, billing, and integrations.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setBusinessWizardOpen(true)}
                  className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
                >
                  {businessNeedsSetup ? "Finish setup" : "Edit"}
                </button>
              </div>

              <dl className="mt-4 grid gap-3 text-sm text-white/70 md:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-white/50">Business name</dt>
                  <dd className="mt-1 text-white">{profile?.businessName ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-white/50">Business phone</dt>
                  <dd className="mt-1 text-white">{profile?.businessPhone ? formatDisplayPhone(profile.businessPhone) : "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-white/50">Timezone</dt>
                  <dd className="mt-1 text-white">{profile?.timezone ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-white/50">Address</dt>
                  <dd className="mt-1 text-white">{addressDisplay || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-white/50">Industry</dt>
                  <dd className="mt-1 text-white">{profile?.industry ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-white/50">CRM</dt>
                  <dd className="mt-1 text-white">{profile?.crm ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-white/50">Locations</dt>
                  <dd className="mt-1 text-white">{profile?.locations ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-white/50">Website</dt>
                  <dd className="mt-1 text-white">
                    {profile?.website ? (
                      <a href={profile.website} className="underline" target="_blank" rel="noreferrer">
                        {profile.website}
                      </a>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
              </dl>

              {businessNeedsSetup ? (
                <div className="mt-4 rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                  Finish setting up your business profile so callers hear the correct details.
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <StepUpDialog
        open={stepUpOpen}
        onClose={() => {
          setStepUpOpen(false);
          setQueuedPayload(null);
        }}
        onVerified={() => {
          if (queuedPayload) {
            void submitAccount(queuedPayload, true);
          }
        }}
        disableEmail
      />

      <BusinessSetupWizard
        open={businessWizardOpen}
        onClose={(completed) => {
          setBusinessWizardOpen(false);
          if (completed) {
            void refresh({ showLoading: true });
          }
        }}
        onCompleted={() => {
          void refresh({ showLoading: true });
        }}
        seed={businessSeed}
        variant={variant === "mobile" ? "sheet" : "modal"}
      />
    </div>
  );
}
