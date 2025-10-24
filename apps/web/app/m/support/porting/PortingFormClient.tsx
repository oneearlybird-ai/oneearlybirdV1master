"use client";

import { useMemo, useState } from "react";

type Field = string;

export default function PortingFormClient() {
  const [org, setOrg] = useState<Field>("");
  const [contact, setContact] = useState<Field>("");
  const [email, setEmail] = useState<Field>("");
  const [phone, setPhone] = useState<Field>("");
  const [numbers, setNumbers] = useState<Field>("");
  const [carrier, setCarrier] = useState<Field>("");
  const [account, setAccount] = useState<Field>("");
  const [pin, setPin] = useState<Field>("");
  const [serviceAddress, setServiceAddress] = useState<Field>("");
  const [desiredWindow, setDesiredWindow] = useState<Field>("");
  const [timezone, setTimezone] = useState<Field>("");
  const [sms, setSms] = useState<boolean>(false);
  const [cnam, setCnam] = useState<Field>("");
  const [notes, setNotes] = useState<Field>("");
  const [status, setStatus] = useState<"" | "copied" | "error">("");

  const disabled = useMemo(() => {
    return !org.trim() || !contact.trim() || !email.trim() || !numbers.trim();
  }, [org, contact, email, numbers]);

  const lines = useMemo(() => {
    return [
      `Organization: ${org}`,
      `Contact: ${contact}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : null,
      "",
      "Numbers to port (one per line):",
      numbers,
      "",
      carrier ? `Current carrier: ${carrier}` : null,
      account ? `Account #: ${account}` : null,
      pin ? `Port-out PIN: ${pin}` : null,
      serviceAddress ? `Service address: ${serviceAddress}` : null,
      cnam ? `CNAM (caller ID name): ${cnam}` : null,
      sms ? "SMS/MMS: required" : "SMS/MMS: not required",
      desiredWindow ? `Desired port window: ${desiredWindow}` : null,
      timezone ? `Timezone: ${timezone}` : null,
      notes ? `Notes: ${notes}` : null,
    ].filter(Boolean) as string[];
  }, [org, contact, email, phone, numbers, carrier, account, pin, serviceAddress, cnam, sms, desiredWindow, timezone, notes]);

  const mailto = useMemo(() => {
    const subject = encodeURIComponent("Port my number to EarlyBird");
    const body = encodeURIComponent(lines.join("\n"));
    return `mailto:support@earlybird.ai?subject=${subject}&body=${body}`;
  }, [lines]);

  return (
    <section id="request" className="mt-12">
      <h2 className="text-lg font-semibold text-white">Quick request</h2>
      <p className="mt-2 text-sm text-white/70">
        Fill in the basics and we’ll start your port. Submitting creates an email draft — no sensitive PHI required.
      </p>

      <form
        className="mt-6 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!disabled) {
            window.location.href = mailto;
          }
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FieldInput label="Organization" required value={org} onChange={setOrg} placeholder="Acme Dental" />
          <FieldInput label="Contact name" required value={contact} onChange={setContact} placeholder="Alex Smith" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FieldInput
            label="Contact email"
            required
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="alex@acme.com"
          />
          <FieldInput label="Contact phone" value={phone} onChange={setPhone} placeholder="(555) 555-1234" />
        </div>
        <FieldTextarea
          label="Numbers to port (one per line)"
          required
          value={numbers}
          onChange={setNumbers}
          placeholder={"+15555550100\n+15555550101"}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <FieldInput label="Current carrier" value={carrier} onChange={setCarrier} placeholder="Current carrier" />
          <FieldInput label="Account #" value={account} onChange={setAccount} placeholder="Carrier account number" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FieldInput label="Port-out PIN" value={pin} onChange={setPin} placeholder="Provided by current carrier" />
          <FieldInput label="CNAM (caller ID name)" value={cnam} onChange={setCnam} placeholder="Your business name" />
        </div>
        <FieldTextarea
          label="Service address"
          value={serviceAddress}
          onChange={setServiceAddress}
          placeholder="Street, city, state, ZIP"
        />
        <div className="grid gap-4 md:grid-cols-2">
          <FieldInput label="Desired port window" value={desiredWindow} onChange={setDesiredWindow} placeholder="e.g., 10/12 between 9-11am" />
          <FieldInput label="Timezone" value={timezone} onChange={setTimezone} placeholder="PT / ET / CT" />
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            checked={sms}
            onChange={(event) => setSms(event.target.checked)}
            className="h-4 w-4 rounded border-white/30 bg-transparent"
          />
          <span>SMS/MMS required</span>
        </label>
        <FieldTextarea label="Notes" value={notes} onChange={setNotes} placeholder="Routing or timing constraints…" rows={3} />

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={disabled ? undefined : mailto}
            onClick={(event) => {
              if (disabled) event.preventDefault();
            }}
            className={`inline-flex items-center rounded-2xl px-5 py-3 text-sm font-semibold ${
              disabled ? "cursor-not-allowed border border-white/20 bg-white/10 text-white/50" : "bg-white text-black hover:bg-white/90"
            }`}
            aria-disabled={disabled}
          >
            Open email draft
          </a>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(lines.join("\n"));
                setStatus("copied");
                setTimeout(() => setStatus(""), 1500);
              } catch {
                setStatus("error");
                setTimeout(() => setStatus(""), 2000);
              }
            }}
            className="inline-flex items-center rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white/80 transition hover:text-white"
          >
            Copy details
          </button>
          <button
            type="button"
            onClick={() => {
              setOrg("");
              setContact("");
              setEmail("");
              setPhone("");
              setNumbers("");
              setCarrier("");
              setAccount("");
              setPin("");
              setServiceAddress("");
              setDesiredWindow("");
              setTimezone("");
              setSms(false);
              setCnam("");
              setNotes("");
              setStatus("");
            }}
            className="inline-flex items-center rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white/80 transition hover:text-white"
          >
            Reset
          </button>
          <span className="text-xs text-white/55" aria-live="polite">
            {status === "copied" ? "Copied to clipboard" : status === "error" ? "Copy failed" : "We reply with a pre-filled LOA and next steps."}
          </span>
        </div>
      </form>
    </section>
  );
}

type FieldInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
};

function FieldInput({ label, value, onChange, placeholder, required, type = "text" }: FieldInputProps) {
  return (
    <label className="text-sm text-white/80">
      <span className="block text-white/60">
        {label}
        {required ? <span className="ml-1 text-white/40">(required)</span> : null}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-white/15 bg-transparent px-4 py-2.5 text-sm text-white outline-none placeholder-white/35 focus:border-white/35 focus:ring-2 focus:ring-white/25"
      />
    </label>
  );
}

type FieldTextareaProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
};

function FieldTextarea({ label, value, onChange, placeholder, rows = 4, required }: FieldTextareaProps) {
  return (
    <label className="text-sm text-white/80">
      <span className="block text-white/60">
        {label}
        {required ? <span className="ml-1 text-white/40">(required)</span> : null}
      </span>
      <textarea
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="mt-2 w-full rounded-2xl border border-white/15 bg-transparent px-4 py-2.5 text-sm text-white outline-none placeholder-white/35 focus:border-white/35 focus:ring-2 focus:ring-white/25"
      />
    </label>
  );
}
