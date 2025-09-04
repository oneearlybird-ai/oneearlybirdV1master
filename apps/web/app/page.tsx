
import Hero from "./(marketing)/Hero";
import Link from "next/link";

export default function Landing() {
  return (
    <main>
      <Hero />
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-6">
        <ValueCard title="Answer & Route" desc="Never miss a lead. Route or transfer intelligently."/>
        <ValueCard title="Book & Reschedule" desc="Real-time scheduling across Google/MS with buffers."/>
        <ValueCard title="Qualify & Capture" desc="Collect contact info and intent; push to CRM."/>
        <ValueCard title="Analytics & Billing" desc="See transcripts, metrics, costs & margins."/>
      </section>
      <section className="max-w-6xl mx-auto px-6 py-10 text-center">
        <Link className="inline-flex items-center rounded-lg bg-[#0B5FFF] px-5 py-3 text-white" href="/roi">Calculate your ROI</Link>
      </section>
    </main>
  );
}
function ValueCard({ title, desc }: any) {
  return (
    <div className="rounded-2xl border p-6 bg-white">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-gray-600 mt-2">{desc}</p>
    </div>
  );
}
