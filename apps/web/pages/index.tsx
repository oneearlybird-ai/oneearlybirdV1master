import Image from 'next/image';
export default function Index() {
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
      </div>
    </main>
  );
}
