"use client";

import { useMemo, useState } from "react";

type Field = string;

export default function ForwardingFormClient() {
  const [org, setOrg] = useState<Field>("");
  const [contact, setContact] = useState<Field>("");
  const [email, setEmail] = useState<Field>("");
  const [phone, setPhone] = useState<Field>("");
  const [numbers, setNumbers] = useState<Field>("");
  const [carrier, setCarrier] = useState<Field>("");
  const [method, setMethod] = useState<Field>("");
  const [bestTime, setBestTime] = useState<Field>("");
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
      "Numbers to forward (one per line):",
      numbers,
      "",
      carrier ? `Current provider / carrier: ${carrier}` : null,
      method ? `Forwarding method today: ${method}` : null,
      bestTime ? `Best time for a verification call: ${bestTime}` : null,
      notes ? `Notes: ${notes}` : null,
    ].filter(Boolean) as string[];
  }, [org, contact, email, phone, numbers, carrier, method, bestTime, notes]);

  const mailto = useMemo(() => {
    const subject = encodeURIComponent("Forward my number to EarlyBird");
    const body = encodeURIComponent(lines.join("\n"));
    return `mailto:support@earlybird.ai?subject=${subject}&body=${body}`;
  }, [lines]);

  return (
    <section id="request" className="mt-6">
      <h2 className="text-lg font-semibold text-white">Need us to do it with you?</h2>
      <p className="mt-2 text-sm text-white/70">Share the basics and we’ll schedule a quick call to switch forwarding together.</p>

      <form
        className="mt-6 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!disabled) {
            window.location.href = mailto;
          }
        }}
      >
        <FieldInput label="Organization" required value={org} onChange={setOrg} placeholder="Acme Dental" />
        <FieldInput label="Contact name" required value={contact} onChange={setContact} placeholder="Alex Smith" />
        <FieldInput label="Contact email" required type="email" value={email} onChange={setEmail} placeholder="alex@acme.com" />
        <FieldInput label="Contact phone" value={phone} onChange={setPhone} placeholder="(555) 555-1234" />
        <FieldTextarea
          label="Numbers to forward (one per line)"
          required
          value={numbers}
          onChange={setNumbers}
          placeholder={"+15555550100\n+15555550101"}
        />
        <FieldInput label="Current provider" value={carrier} onChange={setCarrier} placeholder="Verizon, RingCentral, etc." />
        <FieldInput label="How you forward today" value={method} onChange={setMethod} placeholder="Portal login, dial *72, PBX admin" />
        <FieldInput label="Best time for a test call" value={bestTime} onChange={setBestTime} placeholder="Weekdays after 4pm ET" />
        <FieldTextarea label="Notes" value={notes} onChange={setNotes} placeholder="Anything else we should know" rows={3} />

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
              setMethod("");
              setBestTime("");
              setNotes("");
              setStatus("");
            }}
            className="inline-flex items-center rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white/80 transition hover:text-white"
          >
            Reset
          </button>
          <span className="text-xs text-white/55" aria-live="polite">
            {status === "copied"
              ? "Copied to clipboard"
              : status === "error"
              ? "Copy failed"
              : "We reply with a calendar link and forwarding instructions."}
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
        className="mt-1 w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-white/40 focus:outline-none"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        required={required}
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
        className="mt-1 w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-white/40 focus:outline-none"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        required={required}
      />
    </label>
  );
}
