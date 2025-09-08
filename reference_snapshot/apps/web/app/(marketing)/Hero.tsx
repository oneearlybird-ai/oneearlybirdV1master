
'use client';
import Image from 'next/image';
export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="flex items-center gap-2 mb-5">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700 border border-blue-100">
              New • AI Voice Receptionist
            </span>
          </div>
          <h1 className="text-5xl font-semibold tracking-tight text-[#0B1220]">
            Answer every call. Book more revenue.
          </h1>
          <p className="mt-5 text-lg text-[#4A5568]">
            EarlyBird handles inbound calls—scheduling, FAQs, routing, and lead qualification—then
            delivers transcripts, analytics, and clean billing.
          </p>
          <div className="mt-8 flex gap-3">
            <a className="inline-flex items-center rounded-lg bg-[#0B5FFF] px-5 py-3 text-white hover:bg-[#0847BF] focus:outline-none focus:ring-4 focus:ring-blue-200">
              Start free
            </a>
            <a className="inline-flex items-center rounded-lg border px-5 py-3 hover:bg-gray-50">
              Book a demo
            </a>
          </div>
          <div className="mt-8 flex items-center gap-6 opacity-80">
            <Image src="/logo-lockup-supercrisp-clean.png" alt="EarlyBird" width={140} height={42} />
            <div className="text-sm text-[#4A5568]">Trusted by modern clinics, firms & services</div>
          </div>
        </div>
        <div className="relative">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
            <div className="text-xs text-gray-500 mb-2">Live call preview</div>
            <div className="space-y-3">
              <CallLine who="Caller" text="Hi, can I move my appointment to Friday afternoon?" />
              <CallLine who="EarlyBird" text="Sure—Dr. Park has 2:30pm or 4:10pm. Which works?" />
              <CallLine who="Caller" text="Let’s do 4:10pm." />
              <CallLine who="EarlyBird" text="Done. I’ve sent a confirmation & calendar invite." />
            </div>
            <div className="mt-4 flex justify-between text-xs text-gray-500">
              <span>Latency ~160ms</span><span>On-call cost ~$0.06/min</span>
            </div>
          </div>
          <div className="absolute -z-10 inset-0 blur-3xl opacity-30 bg-gradient-to-tr from-blue-200 via-indigo-200 to-cyan-200" />
        </div>
      </div>
    </section>
  );
}
function CallLine({ who, text }: { who: string; text: string }) {
  const mine = who === 'EarlyBird';
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm
        ${mine ? 'bg-blue-50 text-blue-900 border border-blue-100' : 'bg-gray-50 text-gray-900 border border-gray-200'}`}>
        <span className="font-medium mr-1">{who}:</span>{text}
      </div>
    </div>
  );
}
