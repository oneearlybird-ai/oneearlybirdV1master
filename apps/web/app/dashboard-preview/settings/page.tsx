"use client";

import { useState } from "react";

type DayKey = "Mon"|"Tue"|"Wed"|"Thu"|"Fri"|"Sat"|"Sun";

export default function SettingsPage() {
  const [company, setCompany] = useState("Acme Dental");
  const [tz, setTz] = useState("America/Los_Angeles");
  const [greeting, setGreeting] = useState("Thanks for calling Acme Dental — how can I help today?");
  const [afterHours, setAfterHours] = useState<{ transfer: boolean; voicemail: boolean }>({ transfer: true, voicemail: false });
  const [matrix, setMatrix] = useState<Record<DayKey,{open:boolean; start:string; end:string}>>({
    Mon:{open:true,start:"08:00",end:"18:00"},
    Tue:{open:true,start:"08:00",end:"18:00"},
    Wed:{open:true,start:"08:00",end:"18:00"},
    Thu:{open:true,start:"08:00",end:"18:00"},
    Fri:{open:true,start:"08:00",end:"17:00"},
    Sat:{open:false,start:"09:00",end:"13:00"},
    Sun:{open:false,start:"09:00",end:"13:00"},
  });
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Admin");
  const [flash, setFlash] = useState<string|null>(null);

  const days: DayKey[] = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  function updateDay(d: DayKey, patch: Partial<{open:boolean; start:string; end:string}>) {
    setMatrix(prev => ({ ...prev, [d]: { ...prev[d], ...patch } }));
  }

  function saveAll() {
    // Preview-only: show a toast
    setFlash("Settings saved (preview)");
    setTimeout(() => setFlash(null), 1500);
  }

  function sendInvite() {
    if (!inviteEmail) return;
    setFlash(`Invite sent to ${inviteEmail} as ${inviteRole}`);
    setInviteEmail("");
    setTimeout(() => setFlash(null), 1500);
  }

  return (
    <section>
      <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
      {flash ? <div className="mt-3 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm">{flash}</div> : null}

      <div className="mt-6 grid gap-4 grid-cols-[repeat(auto-fit,minmax(320px,1fr))]">
        {/* Business profile */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="font-medium">Business profile</div>
          <div className="mt-3 space-y-3 text-sm">
            <label className="block">
              Company name
              <input value={company} onChange={e=>setCompany(e.target.value)} className="mt-1 w-full bg-white/5 border border-white/10 rounded-md px-3 py-2" />
            </label>
            <label className="block">
              Time zone
              <input value={tz} onChange={e=>setTz(e.target.value)} className="mt-1 w-full bg-white/5 border border-white/10 rounded-md px-3 py-2" />
            </label>
          </div>
        </div>

        {/* Hours & routing */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-2">
          <div className="font-medium">Hours & routing</div>
          <div className="mt-3 text-sm text-white/80">Set open hours; choose after‑hours behavior.</div>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-[560px] w-full text-sm">
              <thead className="text-white/60">
                <tr>
                  <th className="text-left font-normal">Day</th>
                  <th className="text-left font-normal">Open</th>
                  <th className="text-left font-normal">Start</th>
                  <th className="text-left font-normal">End</th>
                </tr>
              </thead>
              <tbody>
                {days.map(d => (
                  <tr key={d} className="border-b border-white/10">
                    <td className="py-2">{d}</td>
                    <td>
                      <input type="checkbox" checked={matrix[d].open} onChange={e=>updateDay(d,{open:e.target.checked})} />
                    </td>
                    <td>
                      <input type="time" value={matrix[d].start} onChange={e=>updateDay(d,{start:e.target.value})} className="bg-white/5 border border-white/10 rounded-md px-2 py-1" />
                    </td>
                    <td>
                      <input type="time" value={matrix[d].end} onChange={e=>updateDay(d,{end:e.target.value})} className="bg-white/5 border border-white/10 rounded-md px-2 py-1" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 grid gap-3 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
            <label className="flex items-center gap-2 text-sm text-white/80">
              <input type="checkbox" checked={afterHours.transfer} onChange={e=>setAfterHours(s=>({...s, transfer:e.target.checked}))} />
              After‑hours: transfer to on‑call
            </label>
            <label className="flex items-center gap-2 text-sm text-white/80">
              <input type="checkbox" checked={afterHours.voicemail} onChange={e=>setAfterHours(s=>({...s, voicemail:e.target.checked}))} />
              After‑hours: send to voicemail
            </label>
          </div>
        </div>

        {/* AI Assistant greeting */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="font-medium">AI Assistant greeting</div>
          <div className="mt-3 text-sm">Greeting script</div>
          <textarea value={greeting} onChange={e=>setGreeting(e.target.value)} className="mt-1 w-full h-24 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm" />
          <div className="mt-3 text-sm">FAQs CSV (optional)</div>
          <div className="mt-1"><button className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:text-white">Upload file</button></div>
        </div>

        {/* Team & invites */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-2">
          <div className="font-medium">Team & access</div>
          <div className="mt-3 grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
            <div>
              <div className="text-sm text-white/60">Members</div>
              <ul className="mt-2 text-sm text-white/80 space-y-1">
                <li>Alex (Owner) — alex@acme.com</li>
                <li>Mia (Admin) — mia@acme.com</li>
              </ul>
            </div>
            <div>
              <div className="text-sm text-white/60">Invite a teammate</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <input type="email" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} placeholder="teammate@company.com" className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm" />
                <select value={inviteRole} onChange={e=>setInviteRole(e.target.value)} className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm">
                  <option>Admin</option>
                  <option>Viewer</option>
                </select>
                <button onClick={sendInvite} className="rounded-md bg-white text-black px-3 py-2 text-sm font-medium hover:bg-white/90">Send invite</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button onClick={saveAll} className="rounded-md bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90">Save changes</button>
        <button onClick={()=>setFlash("Changes discarded (preview)")} className="rounded-md border border-white/20 px-4 py-2 text-sm text-white/80 hover:text-white">Cancel</button>
      </div>
    </section>
  );
}
