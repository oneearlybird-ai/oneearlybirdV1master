"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/http";
import { fetchCsrfToken, invalidateCsrfToken } from "@/lib/security";
import StepUpDialog from "@/components/business/StepUpDialog";
import { toast } from "@/components/Toasts";
import { formatAddressLine, formatDisplayPhone, formatE164Input } from "@/lib/format";
import Sheet from "@/components/mobile/Sheet";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";

type AddressNormalized = {
  line1: string;
  line2?: string | null;
  city: string;
  region: string;
  postal: string;
  country: string;
  lat?: number | null;
  lng?: number | null;
};

type BusinessHours = { day: string; open: string; close: string };

export type BusinessProfilePayload = {
  businessName: string;
  phoneE164: string;
  timezone: string;
  addressNormalized: AddressNormalized;
  hours?: BusinessHours[];
  industry?: string | null;
  crm?: "hubspot" | "salesforce" | "none" | "other" | string | null;
  locations?: number | null;
  website?: string | null;
  businessEmail?: string | null;
  aiConsent?: boolean;
};

export type BusinessProfileSeed = Partial<BusinessProfilePayload> & {
  contactEmail?: string | null;
  contactPhone?: string | null;
  firstName?: string | null;
  businessPhone?: string | null;
  aiConsent?: boolean | null;
};

type Suggestion = { id: string; text: string; subtitle?: string | null };

type WizardVariant = "modal" | "sheet";

type BusinessSetupWizardProps = {
  open: boolean;
  onClose: (completed: boolean) => void;
  onCompleted?: () => void;
  seed?: BusinessProfileSeed | null;
  variant?: WizardVariant;
};

const DAYS: BusinessHours[] = [
  { day: "Mon", open: "09:00", close: "17:00" },
  { day: "Tue", open: "09:00", close: "17:00" },
  { day: "Wed", open: "09:00", close: "17:00" },
  { day: "Thu", open: "09:00", close: "17:00" },
  { day: "Fri", open: "09:00", close: "17:00" },
  { day: "Sat", open: "10:00", close: "14:00" },
  { day: "Sun", open: "Closed", close: "Closed" },
];

const DEFAULT_TIMEZONE = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC" : "UTC";

function WizardContainer({ open, onClose, variant = "modal", children }: { open: boolean; onClose: () => void; variant?: WizardVariant; children: React.ReactNode }) {
  if (!open) return null;
  if (variant === "sheet") {
    return (
      <Sheet open={open} onClose={onClose} title="Set up your business">
        {children}
      </Sheet>
    );
  }
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 px-4">
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-neutral-950/95 p-6 text-white shadow-2xl">
        <button
          type="button"
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          onClick={onClose}
          aria-label="Close setup wizard"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" strokeWidth={1.5} fill="none">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}

export default function BusinessSetupWizard({ open, onClose, onCompleted, seed, variant = "modal" }: BusinessSetupWizardProps) {
  const { status: sessionStatus, profile } = useAuthSession();
  const [step, setStep] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showStepUp, setShowStepUp] = useState(false);
  const [queuedPayload, setQueuedPayload] = useState<BusinessProfilePayload | null>(null);

  const [businessName, setBusinessName] = useState(seed?.businessName ?? "");
  const [phone, setPhone] = useState(seed?.phoneE164 ?? seed?.businessPhone ?? "");
  const [timezone, setTimezone] = useState(seed?.timezone ?? DEFAULT_TIMEZONE);
  const [businessEmail, setBusinessEmail] = useState(seed?.businessEmail ?? seed?.contactEmail ?? "");
  const [aiConsent, setAiConsent] = useState(Boolean(seed?.aiConsent));

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [address, setAddress] = useState<AddressNormalized | null>(seed?.addressNormalized ?? null);
  const [addressPreview, setAddressPreview] = useState(() => (seed?.addressNormalized ? formatAddressLine(seed.addressNormalized) : ""));
  const [hours, setHours] = useState<BusinessHours[]>(() => (seed?.hours && seed.hours.length > 0 ? seed.hours : DAYS));
  const [industry, setIndustry] = useState(seed?.industry ?? "");
  const [crm, setCrm] = useState(seed?.crm ?? "none");
  const [locations, setLocations] = useState<number | "" | null>(seed?.locations ?? 1);
  const [website, setWebsite] = useState(seed?.website ?? "");

  const tenantReady = useMemo(() => sessionStatus === "authenticated" && Boolean(profile?.tenantId), [profile?.tenantId, sessionStatus]);

  useEffect(() => {
    if (!open) {
      setStep(0);
      setError(null);
      setFieldErrors({});
      setShowStepUp(false);
      setQueuedPayload(null);
    } else {
      setBusinessName(seed?.businessName ?? "");
      setPhone(seed?.phoneE164 ?? seed?.businessPhone ?? "");
      setTimezone(seed?.timezone ?? DEFAULT_TIMEZONE);
      setBusinessEmail(seed?.businessEmail ?? seed?.contactEmail ?? "");
      setAiConsent(Boolean(seed?.aiConsent));
    }
  }, [open, seed?.aiConsent, seed?.businessEmail, seed?.businessName, seed?.businessPhone, seed?.contactEmail, seed?.phoneE164, seed?.timezone]);

  useEffect(() => {
    if (!open || !tenantReady) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return undefined;
    }
    if (query.trim().length < 3) {
      setSuggestions([]);
      return undefined;
    }
    const controller = new AbortController();
    const handle = window.setTimeout(async () => {
      setLoadingSuggestions(true);
      setError(null);
      try {
        const res = await apiFetch(`/places/suggest?q=${encodeURIComponent(query.trim())}&limit=5`, {
          cache: "no-store",
          suppressAuthRedirect: true,
          signal: controller.signal,
          headers: { accept: "application/json" },
        });
        if (res.status === 401 || res.status === 403) {
          setError("Can’t verify address yet. Check your connection or try again.");
          setSuggestions([]);
          return;
        }
        if (!res.ok) {
          throw new Error(`suggest_${res.status}`);
        }
        const json = (await res.json()) as { items?: Suggestion[] };
        setSuggestions(Array.isArray(json?.items) ? json.items : []);
      } catch (err) {
        if ((err as Error)?.name === "AbortError") {
          return;
        }
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 320);
    return () => {
      controller.abort();
      window.clearTimeout(handle);
    };
  }, [open, query, tenantReady]);

  const resetFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const selectSuggestion = async (item: Suggestion) => {
    if (!tenantReady) {
      setError("We’re still finalising your account. Try again shortly.");
      return;
    }
    try {
      setPending(true);
      setError(null);
      const url = `/places/resolve?id=${encodeURIComponent(item.id ?? "")}`;
      const res = await apiFetch(url, {
        method: "GET",
        suppressAuthRedirect: true,
        headers: {
          accept: "application/json",
        },
      });
      if (res.status === 401 || res.status === 403) {
        setError("Can’t verify address yet. Check your connection or try again.");
        return;
      }
      if (!res.ok) {
        throw new Error(`resolve_${res.status}`);
      }
      const json = (await res.json()) as { place?: AddressNormalized };
      if (!json?.place) {
        throw new Error("resolve_no_place");
      }
      setAddress(json.place);
      setAddressPreview(formatAddressLine(json.place));
      setQuery("");
      setSuggestions([]);
    } catch (err) {
      console.error(err);
      setError("We couldn’t resolve that address. Try another search.");
    } finally {
      setPending(false);
    }
  };

  const nextStep = () => {
    if (step === 0) {
      const errors: Record<string, string> = {};
      if (!businessName.trim()) errors.businessName = "Enter your business name.";
      if (!phone.trim()) errors.phone = "Enter your business phone.";
      if (!timezone.trim()) errors.timezone = "Choose your timezone.";
      setFieldErrors(errors);
      if (Object.keys(errors).length > 0) return;
    }
    if (step === 1 && !address) {
      setError("Select your business address before continuing.");
      return;
    }
    setError(null);
    setStep((prev) => Math.min(prev + 1, 2));
  };

  const prevStep = () => {
    setError(null);
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const submitProfile = useCallback(
    async (payload: BusinessProfilePayload, retrying = false) => {
      setPending(true);
      setError(null);
      setFieldErrors({});
      try {
        const token = await fetchCsrfToken();
        const res = await apiFetch("/profile/setup", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(token ? { "x-csrf-token": token } : {}),
          },
          body: JSON.stringify(payload),
        });
        if (res.status === 200) {
          toast("Provisioning…", "success");
          onCompleted?.();
          onClose(true);
          return;
        }
        if (res.status === 403) {
          const json = (await res.json().catch(() => ({}))) as { code?: string };
          if (json?.code === "step_up_required" && !retrying) {
            setQueuedPayload(payload);
            setShowStepUp(true);
            return;
          }
          setError("Additional verification required. Try again.");
          return;
        }
        if (res.status === 400) {
          const json = (await res.json().catch(() => ({}))) as { code?: string; fields?: Record<string, string> };
          if (json?.code === "validation_error" && json?.fields) {
            setFieldErrors(json.fields);
            setError("Fix the highlighted fields to continue.");
          } else {
            setError("We could not save your profile. Try again.");
          }
          return;
        }
        setError("Something went wrong while saving. Try again soon.");
      } catch (err) {
        console.error(err);
        setError("We could not reach the server. Check your connection and try again.");
        invalidateCsrfToken();
      } finally {
        setPending(false);
      }
    },
    [onClose, onCompleted],
  );

  const onSubmit = (includeOptional: boolean) => {
    if (!address) {
      setError("Select your business address before finishing.");
      setStep(1);
      return;
    }
    if (!aiConsent) {
      setFieldErrors((prev) => ({ ...prev, aiConsent: "Accept the consent to continue." }));
      setError("Review and accept the consent to continue.");
      return;
    }
    const payload: BusinessProfilePayload = {
      businessName: businessName.trim(),
      phoneE164: formatE164Input(phone.trim()),
      timezone: timezone.trim(),
      addressNormalized: address,
      hours: includeOptional ? hours.filter((h) => h.open !== "Closed" && h.close !== "Closed") : undefined,
      industry: includeOptional && industry.trim() ? industry.trim() : undefined,
      crm: includeOptional ? crm || "none" : undefined,
      locations: includeOptional && typeof locations === "number" && locations >= 1 ? locations : undefined,
      website: includeOptional && website.trim() ? website.trim() : undefined,
      aiConsent: true,
    };
    const email = businessEmail.trim();
    if (includeOptional && email.length > 0) {
      payload.businessEmail = email;
    }
    submitProfile(payload);
  };

  const handleStepUpVerified = (stepUpOkUntil?: string | null) => {
    if (!queuedPayload) return;
    setShowStepUp(false);
    submitProfile(queuedPayload, true);
    setQueuedPayload(null);
    if (stepUpOkUntil) {
      console.info("step-up valid until", stepUpOkUntil);
    }
  };

  const renderedStep = useMemo(() => {
    if (step === 0) {
      return (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Tell us about your business</h2>
            <p className="mt-1 text-sm text-white/60">We’ll use this information in caller greetings and billing.</p>
          </div>
          <label className="block text-xs font-medium uppercase tracking-wide text-white/60">
            Business name
            <input
              type="text"
              className={`mt-1 w-full rounded-xl border ${fieldErrors.businessName ? "border-rose-400/60" : "border-white/15"} bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-white/40 focus:bg-white/10`}
              value={businessName}
              onChange={(event) => {
                setBusinessName(event.target.value);
                resetFieldError("businessName");
              }}
              maxLength={100}
            />
            {fieldErrors.businessName ? <span className="mt-1 block text-xs text-rose-300">{fieldErrors.businessName}</span> : null}
          </label>
          <label className="block text-xs font-medium uppercase tracking-wide text-white/60">
            Business phone (E.164)
            <input
              type="tel"
              className={`mt-1 w-full rounded-xl border ${fieldErrors.phoneE164 || fieldErrors.phone ? "border-rose-400/60" : "border-white/15"} bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-white/40 focus:bg-white/10`}
              value={phone}
              onChange={(event) => {
                setPhone(formatE164Input(event.target.value));
                resetFieldError("phoneE164");
                resetFieldError("phone");
              }}
              placeholder="+1XXXXXXXXXX"
            />
            <span className="mt-1 block text-xs text-white/40">{formatDisplayPhone(phone)}</span>
            {fieldErrors.phoneE164 ? <span className="mt-1 block text-xs text-rose-300">{fieldErrors.phoneE164}</span> : null}
          </label>
          <label className="block text-xs font-medium uppercase tracking-wide text-white/60">
            Timezone
            <input
              type="text"
              className={`mt-1 w-full rounded-xl border ${fieldErrors.timezone ? "border-rose-400/60" : "border-white/15"} bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-white/40 focus:bg-white/10`}
              value={timezone}
              onChange={(event) => {
                setTimezone(event.target.value);
                resetFieldError("timezone");
              }}
              placeholder="America/New_York"
            />
            {fieldErrors.timezone ? <span className="mt-1 block text-xs text-rose-300">{fieldErrors.timezone}</span> : null}
          </label>
        </div>
      );
    }

    if (step === 1) {
      return (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Where are you located?</h2>
            <p className="mt-1 text-sm text-white/60">We’ll normalize the address for transcripts, billing, and integrations.</p>
          </div>
          <label className="block text-xs font-medium uppercase tracking-wide text-white/60">
            Search for your address
            <input
              type="text"
              className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-white/40 focus:bg-white/10"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="1521 N Example St"
            />
          </label>
          {loadingSuggestions ? (
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">Searching…</div>
          ) : null}
          {suggestions.length > 0 ? (
            <div className="space-y-2">
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-left text-sm text-white/80 transition hover:border-white/30 hover:bg-white/10"
                  onClick={() => selectSuggestion(item)}
                  disabled={pending}
                >
                  <div className="font-medium text-white">{item.text}</div>
                  {item.subtitle ? <div className="text-sm text-white/60">{item.subtitle}</div> : null}
                </button>
              ))}
            </div>
          ) : null}
          {address ? (
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
              <div className="text-xs uppercase tracking-wide text-emerald-300">Selected address</div>
              <div className="mt-1 font-medium text-emerald-100">{addressPreview}</div>
            </div>
          ) : null}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Any other details?</h2>
          <p className="mt-1 text-sm text-white/60">These fields are optional. You can finish later from Settings.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-xs font-medium uppercase tracking-wide text-white/60">
            Business email (optional)
            <input
              type="email"
              className={`mt-1 w-full rounded-xl border ${fieldErrors.businessEmail ? "border-rose-400/60" : "border-white/15"} bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-white/40 focus:bg-white/10`}
              value={businessEmail}
              onChange={(event) => {
                setBusinessEmail(event.target.value);
                resetFieldError("businessEmail");
              }}
              placeholder="you@business.com"
              autoComplete="email"
            />
            {fieldErrors.businessEmail ? <span className="mt-1 block text-xs text-rose-300">{fieldErrors.businessEmail}</span> : null}
          </label>
          <label className="block text-xs font-medium uppercase tracking-wide text-white/60">
            Industry
            <input
              type="text"
              className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-white/40 focus:bg-white/10"
              value={industry}
              onChange={(event) => setIndustry(event.target.value)}
            />
          </label>
          <label className="block text-xs font-medium uppercase tracking-wide text-white/60">
            CRM
            <select
              className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-white/40 focus:bg-white/10"
              value={crm}
              onChange={(event) => setCrm(event.target.value)}
            >
              <option value="none">None</option>
              <option value="hubspot">HubSpot</option>
              <option value="salesforce">Salesforce</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="block text-xs font-medium uppercase tracking-wide text-white/60">
            Number of locations
            <input
              type="number"
              min={1}
              className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-white/40 focus:bg-white/10"
              value={locations ?? ""}
              onChange={(event) => {
                const value = event.target.value;
                setLocations(value === "" ? "" : Math.max(1, Number(value)));
              }}
            />
          </label>
          <label className="block text-xs font-medium uppercase tracking-wide text-white/60 md:col-span-2">
            Website (https://…)
            <input
              type="url"
              className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-white/40 focus:bg-white/10"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              placeholder="https://example.com"
            />
          </label>
        </div>
        <div
          className={`rounded-2xl border ${fieldErrors.aiConsent ? "border-rose-400/60 bg-rose-600/10" : "border-white/15 bg-white/5"} px-4 py-3`}
        >
          <label className="flex items-start gap-3 text-sm text-white/80">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 shrink-0 rounded border border-white/30 bg-black/30 text-white accent-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              checked={aiConsent}
              onChange={(event) => {
                setAiConsent(event.target.checked);
                if (event.target.checked) {
                  resetFieldError("aiConsent");
                }
              }}
            />
            <span>Use info above for AI configuration</span>
          </label>
        </div>
        {fieldErrors.aiConsent ? <p className="text-xs text-rose-300">{fieldErrors.aiConsent}</p> : null}
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-white/60">Operating hours</div>
          <div className="mt-2 space-y-2">
            {hours.map((slot, index) => (
              <div key={slot.day} className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="w-12 text-sm font-medium text-white/80">{slot.day}</span>
                <label className="flex items-center gap-2 text-xs text-white/60">
                  <span>Open</span>
                  <input
                    type="time"
                    value={slot.open === "Closed" ? "09:00" : slot.open}
                    onChange={(event) => {
                      const value = event.target.value;
                      setHours((prev) =>
                        prev.map((h, i) => (i === index ? { ...h, open: value } : h)),
                      );
                    }}
                    className="rounded-md border border-white/10 bg-white/10 px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30"
                  />
                </label>
                <label className="flex items-center gap-2 text-xs text-white/60">
                  <span>Close</span>
                  <input
                    type="time"
                    value={slot.close === "Closed" ? "17:00" : slot.close}
                    onChange={(event) => {
                      const value = event.target.value;
                      setHours((prev) =>
                        prev.map((h, i) => (i === index ? { ...h, close: value } : h)),
                      );
                    }}
                    className="rounded-md border border-white/10 bg-white/10 px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30"
                  />
                </label>
                <button
                  type="button"
                  className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                  onClick={() => {
                    setHours((prev) =>
                      prev.map((h, i) => (i === index ? { ...h, open: "Closed", close: "Closed" } : h)),
                    );
                  }}
                >
                  Closed
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }, [address, addressPreview, aiConsent, businessEmail, businessName, crm, fieldErrors, hours, industry, loadingSuggestions, pending, phone, query, resetFieldError, step, suggestions, timezone, website, locations]);

  return (
    <>
      <WizardContainer open={open} onClose={() => onClose(false)} variant={variant}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm text-white/70">
                {step + 1}/3
              </span>
              <div>
                <div className="text-sm text-white/60">Business setup</div>
                <div className="text-lg font-semibold">
                  {step === 0 ? "Company basics" : step === 1 ? "Business address" : "Additional details"}
                </div>
              </div>
            </div>
          </div>

          {renderedStep}

          {error ? <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

          <div className="flex flex-wrap justify-between gap-3 pt-2">
            <div>
              {step > 0 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="rounded-xl border border-white/20 px-4 py-2.5 text-sm text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                  disabled={pending}
                >
                  Back
                </button>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-3">
              {step === 2 ? (
                <>
                  <button
                    type="button"
                    onClick={() => onSubmit(false)}
                    disabled={pending}
                    className="rounded-xl border border-white/20 px-4 py-2.5 text-sm text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:opacity-60"
                  >
                    Finish later
                  </button>
                  <button
                    type="button"
                    onClick={() => onSubmit(true)}
                    disabled={pending}
                    className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-60"
                  >
                    {pending ? "Saving…" : "Save profile"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={pending}
                  className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-60"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </WizardContainer>

      <StepUpDialog
        open={showStepUp}
        onClose={() => {
          setShowStepUp(false);
          setQueuedPayload(null);
        }}
        onVerified={handleStepUpVerified}
        disableEmail
      />
    </>
  );
}
