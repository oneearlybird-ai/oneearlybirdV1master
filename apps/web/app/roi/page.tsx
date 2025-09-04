
'use client';
import { useMemo, useState } from "react";
export default function ROIPage() {
  const [callsPerDay, setCallsPerDay] = useState(80);
  const [avgHandleMin, setAvgHandleMin] = useState(3);
  const [receptionistWage, setReceptionistWage] = useState(22);
  const [assistantPricePerMin, setAssistantPricePerMin] = useState(0.25);
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const results = useMemo(() => {
    const callsWeek = callsPerDay * daysPerWeek;
    const minsHuman = callsWeek * avgHandleMin;
    const humanCost = (minsHuman / 60) * receptionistWage;
    const aiCost = minsHuman * assistantPricePerMin;
    const savings = Math.max(0, humanCost - aiCost);
    const timeFreedHrs = minsHuman / 60;
    return { callsWeek, minsHuman, humanCost, aiCost, savings, timeFreedHrs };
  }, [callsPerDay, avgHandleMin, receptionistWage, assistantPricePerMin, daysPerWeek]);
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-semibold">ROI Calculator</h1>
      <p className="text-gray-600 mt-2">Estimate savings using EarlyBird vs in-house reception.</p>
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <Field label="Calls per day" value={callsPerDay} set={setCallsPerDay} />
        <Field label="Avg minutes per call" value={avgHandleMin} set={setAvgHandleMin} />
        <Field label="Receptionist wage ($/hr)" value={receptionistWage} set={setReceptionistWage} step={1} />
        <Field label="EarlyBird price ($/min)" value={assistantPricePerMin} set={setAssistantPricePerMin} step={0.01} />
        <Field label="Days per week" value={daysPerWeek} set={setDaysPerWeek} />
      </div>
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <Stat title="Weekly calls" value={results.callsWeek.toLocaleString()} />
        <Stat title="Minutes handled (wk)" value={results.minsHuman.toLocaleString()} />
        <Stat title="Time freed (hrs/wk)" value={results.timeFreedHrs.toFixed(1)} />
      </div>
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <Card title="Human Reception Cost (wk)" value={`$${results.humanCost.toFixed(2)}`} />
        <Card title="EarlyBird Cost (wk)" value={`$${results.aiCost.toFixed(2)}`} />
      </div>
      <div className="mt-6">
        <div className="rounded-xl border p-4 bg-green-50 border-green-200">
          <div className="text-sm text-green-700">Estimated Weekly Savings</div>
          <div className="text-3xl font-semibold text-green-800">${results.savings.toFixed(2)}</div>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-6">Assumptions are editable. Taxes/benefits excluded; pricing subject to plan.</p>
    </div>
  );
}
function Field({ label, value, set, step=1 }: any) {
  return (
    <label className="block">
      <div className="text-sm text-gray-600">{label}</div>
      <input type="number" step={step} value={value}
        onChange={e=>set(Number(e.target.value))}
        className="mt-1 w-full border rounded p-2" />
    </label>
  );
}
function Stat({ title, value }: any) {
  return (
    <div className="rounded-xl border p-4">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
function Card({ title, value }: any) {
  return (
    <div className="rounded-xl border p-4">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-3xl font-semibold">{value}</div>
    </div>
  );
}
