
'use client';
import { useState } from 'react';
const API = process.env.NEXT_PUBLIC_API_URL;
export default function SupportPage() {
  const [email,setEmail] = useState('');
  const [message,setMessage] = useState('');
  const [sent,setSent] = useState(false);
  async function submit() {
    await fetch(`${API}/support`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,message})});
    setSent(true);
  }
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold">Contact Support</h1>
      {!sent ? (
        <div className="mt-6 space-y-4">
          <input className="border rounded p-2 w-full" placeholder="Your email" value={email} onChange={e=>setEmail(e.target.value)} />
          <textarea className="border rounded p-2 w-full min-h-[120px]" placeholder="How can we help?" value={message} onChange={e=>setMessage(e.target.value)} />
          <button onClick={submit} className="px-4 py-2 rounded bg-black text-white">Send</button>
        </div>
      ) : (
        <p className="mt-6">Thanks! We’ll reply shortly.</p>
      )}
    </div>
  );
}
