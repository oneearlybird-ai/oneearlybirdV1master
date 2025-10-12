export function normalisePhone(value: string | null): string {
  if (!value) return "—";
  const trimmed = value.trim();
  if (!trimmed) return "—";
  const digits = trimmed.replace(/[^\d]/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length > 10) {
    const local = digits.slice(-10);
    return `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
  }
  return trimmed;
}

export function formatCallDuration(sec: number): string {
  if (!Number.isFinite(sec) || sec <= 0) return "00:00";
  const minutes = Math.floor(sec / 60);
  const seconds = Math.floor(sec % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatCallTimestamp(iso: string): string {
  const ts = new Date(iso);
  if (!Number.isFinite(ts.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(ts);
}

export function outcomeLabel(outcome: string): string {
  switch (outcome) {
    case "answered":
      return "Answered";
    case "appointmentBooked":
      return "Appointment booked";
    case "voicemail":
      return "Voicemail deflected";
    case "missed":
      return "Missed";
    default:
      return outcome?.replace(/([A-Z])/g, " $1")?.replace(/^\w/, (c) => c.toUpperCase()) ?? "Unknown";
  }
}
