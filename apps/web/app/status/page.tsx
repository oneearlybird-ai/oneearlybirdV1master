"use client";
import { useEffect, useState } from "react";

type Status = { ok: boolean; zone: string; hipaa: string; time: string };
export default function StatusPage() {
  const [data, setData] = useState<Status | null>(null);
  useEffect(() => {
    let active = true;
    fetch("/api/status").then(r=>r.json()).then((j: Status)=>{ if(active) setData(j); }).catch(()=>{});
    return () => { active = false; };
  }, []);
  return (
    <main className="p-6">
      <h2>Status</h2>
      <pre className="bg-gray-100 p-3 rounded">{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
