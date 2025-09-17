"use client";

import { useMemo, useState } from "react";

type Field = string;

export default function PortingFormClient() {
  const [org, setOrg] = useState<Field>("");
  const [contact, setContact] = useState<Field>("");
  const [email, setEmail] = useState<Field>("");
  const [phone, setPhone] = useState<Field>("");
  const [numbers, setNumbers] = useState<Field>(""); // one per line
  const [carrier, setCarrier] = useState<Field>("");
  const [account, setAccount] = useState<Field>("");
  const [pin, setPin] = useState<Field>("");
  const [serviceAddress, setServiceAddress] = useState<Field>("");
  const [desiredWindow, setDesiredWindow] = useState<Field>("");
  const [timezone, setTimezone] = useState<Field>("");
  const [sms, setSms] = useState<boolean>(false);
  const [cnam, setCnam] = useState<Field>("");
  const [notes, setNotes] = useState<Field>("");

  const disabled = useMemo(() => {
    return !org.trim() || !contact.trim() || !email.trim() || !numbers.trim();
  }, [org, contact, email, numbers]);

  const mailto = useMemo(() => {
    const subject = encodeURIComponent("Port my number to EarlyBird");
    const bodyLines = [
      `Organization: ${org}`,
      `Contact: ${contact}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : null,
      "",
      `Numbers to port (one per line):`,
      numbers,
      "",
      carrier ? `Current carrier: ${carrier}` : null,
      account ? `Account #: ${account}` : null,
      pin ? `Port-out PIN: ${pin}` : null,
      serviceAddress ? `Service address: ${serviceAddress}` : null,
      cnam ? `CNAM (caller ID name): ${cnam}` : null,
      sms ? `SMS/MMS: required` : `SMS/MMS: not required`,
      desiredWindow ? `Desired port window: ${desiredWindow}` : null,
      timezone ? `Timezone: ${timezone}` : null,
      notes ? `Notes: ${notes}` : null,
    ].filter(Boolean);
    const body = encodeURIComponent(bodyLines.join("\n"));
    return `mailto:support@earlybird.ai?subject=${subject}&body=${body}`;
  }, [org, contact, email, phone, numbers, carrier, account, pin, serviceAddress, desiredWindow, timezone, sms, cnam, notes]);

  return (
    <section id="request" className="mt-10">
      <h2 className="text-xl font-medium">Quick request</h2>
      <p className="mt-2 text-white/70 text-sm">Fill in the basics and we’ll start your port. This creates an email draft — no sensitive PHI.</p>

      <form className="mt-4 grid gap-3" onSubmit={(e) => { e.preventDefault(); if (!disabled) window.location.href = mailto; }}>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="text-sm">
            <span className="block text-white/70">Organization (required)</span>
            <input value={org} onChange={e=>setOrg(e.target.value)} className="mt-1 w-full rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm outline-none placeholder-white/40" placeholder="Acme Dental" required />
          </label>
          <label className="text-sm">
            <span className="block text-white/70">Contact name (required)</span>
            <input value={contact} onChange={e=>setContact(e.target.value)} className="mt-1 w-full rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm outline-none placeholder-white/40" placeholder="Alex Smith" required />
          </label>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <label className="text-sm">
            <span className="block text-white/70">Contact email (required)</span>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm outline-none placeholder-white/40" placeholder="alex@acme.com" required />
          </label>
          <label className="text-sm">
            <span className="block text-white/70">Contact phone</span>
            <input value={phone} onChange={e=>setPhone(e.target.value)} className="mt-1 w-full rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm outline-none placeholder-white/40" placeholder="(555) 555-1234" />
          </label>
        </div>

        <label className="text-sm">
          <span className="block text-white/70">Numbers to port (one per line, required)</span>
          <textarea value={numbers} onChange={e=>setNumbers(e.target.value)} className="mt-1 w-full rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm outline-none placeholder-white/40" rows={3} placeholder="+1 555-555-0100\n+1 555-555-0101" required />
        </label>

        <div className="grid gap-2 sm:grid-cols-2">
          <label className="text-sm">
            <span className="block text-white/70">Current carrier</span>
            <input value={carrier} onChange={e=>setCarrier(e.target.value)} className="mt-1 w-full rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm outline-none placeholder-white/40" placeholder="Carrier name" />
          </label>
          <label className="text-sm">
            <span className="block text-white/70">Account #</span>
            <input value={account} onChange={e=>setAccount(e.target.value)} className="mt-1 w-full rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm outline-none placeholder-white/40" placeholder="123456" />
          </label>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <label className="text-sm">
            <span className="block text-white/70">Port‑out PIN</span>
            <input value={pin} onChange={e=>setPin(e.target.value)} className="mt-1 w-full rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm outline-none placeholder-white/40" placeholder="0000" />
          </label>
          <label className="text-sm">
            <span className="block text-white/70">CNAM (caller ID name)</span>
            <input value={cnam} onChange={e=>setCnam(e.target.value)} className="mt-1 w-full rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm outline-none placeholder-white/40" placeholder="ACME DENTAL" />
          </label>
        </div>

        <label className="text-sm">
          <span className="block text-white/70">Service address</span>
          <textarea value={serviceAddress} onChange={e=>setServiceAddress(e.target.value)} className="mt-1 w-full rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm outline-none placeholder-white/40" rows={2} placeholder="123 Main St, Springfield, ST 00000" />
        </label>

        <div className="grid gap-2 sm:grid-cols-2">
          <label className="text-sm">
            <span className="block text-white/70">Desired port window</span>
            <input value={desiredWindow} onChange={e=>setDesiredWindow(e.target.value)} className="mt-1 w-full rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm outline-none placeholder-white/40" placeholder="e.g., Tue–Thu next week, 10am–2pm" />
          </label>
          <label className="text-sm">
            <span className="block text-white/70">Timezone</span>
            <input value={timezone} onChange={e=>setTimezone(e.target.value)} className="mt-1 w-full rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm outline-none placeholder-white/40" placeholder="e.g., PT / ET" />
          </label>
        </div>

        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={sms} onChange={e=>setSms(e.target.checked)} className="h-4 w-4 rounded border-white/30 bg-transparent" />
          <span>SMS/MMS required</span>
        </label>

        <label className="text-sm">
          <span className="block text-white/70">Notes</span>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} className="mt-1 w-full rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm outline-none placeholder-white/40" rows={3} placeholder="Any special routing or timing constraints…" />
        </label>

        <div className="mt-2 flex items-center gap-3">
          <a
            href={disabled ? undefined : mailto}
            onClick={(e) => { if (disabled) e.preventDefault(); }}
            className={`inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium ${disabled ? 'bg-white/20 text-white/60 cursor-not-allowed' : 'bg-white text-black hover:bg-white/90'}`}
            aria-disabled={disabled}
          >
            Open email draft
          </a>
          <span className="text-xs text-white/50">We’ll reply with a pre‑filled LOA and next steps.</span>
        </div>
      </form>
    </section>
  );
}

