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
    <main style={{ padding: 24 }}>
      <h2>Status</h2>
      <pre style={{ background: "#f7f7f7", padding: 12, borderRadius: 8 }}>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
