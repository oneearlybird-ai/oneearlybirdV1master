'use client';
import Image from 'next/image';

export default function Home() {
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3">
          <Image src="/logo-lockup-supercrisp-clean.png" width={180} height={54} alt="EarlyBird"/>
          <h1 className="text-3xl font-bold">EarlyBird — AI Receptionist</h1>
        </div>
        <p className="mt-4 text-gray-700">
          Handle inbound calls automatically — scheduling, FAQs, routing, and lead capture.
        </p>
        <div className="mt-6 flex gap-3">
          <a className="px-4 py-2 rounded bg-black text-white" href="/?demo=1">Try Demo</a>
          <a className="px-4 py-2 rounded border" href="https://earlybird.ai">Learn More</a>
        </div>
        <div className="mt-10">
          <h2 className="font-semibold">Demo Endpoints</h2>
          <ul className="list-disc ml-6 mt-2 text-sm">
            <li><a className="text-blue-600" href={`${api}/demo`} target="_blank">/demo</a></li>
            <li><a className="text-blue-600" href={`${api}/analytics/calls`} target="_blank">/analytics/calls</a></li>
            <li><a className="text-blue-600" href={`${api}/transcripts`} target="_blank">/transcripts</a></li>
            <li><a className="text-blue-600" href={`${api}/billing/invoices/in_demo_001/pdf`} target="_blank">/billing/invoices/:id/pdf</a></li>
          </ul>
        </div>
      </div>
    </main>
  );
}
