"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/http";
import { dashboardFetch } from "@/lib/dashboardFetch";

type BookingItem = {
  id: string;
  ts: string;
  title: string;
  attendee: string | null;
  source: string | null;
  status: string | null;
  notes: string | null;
};

type BookingListResponse = {
  items: BookingItem[];
  window?: string;
};

type CreateFormState = {
  title: string;
  attendee: string;
  ts: string;
};

function formatTimestamp(iso: string): string {
  const dt = new Date(iso);
  if (!Number.isFinite(dt.getTime())) return "—";
  return dt.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AppointmentsPage() {
  const [windowFilter, setWindowFilter] = useState<"week" | "month" | "day">("week");
  const [items, setItems] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateFormState>({ title: "", attendee: "", ts: "" });
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const fetchBookings = useCallback(
    async (windowValue: "week" | "month" | "day") => {
      setLoading(true);
      setError(null);
      try {
        const res = await dashboardFetch(`/bookings/list?window=${windowValue}`, { cache: "no-store" });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `bookings_list_${res.status}`);
        }
        const json = (await res.json()) as BookingListResponse;
        setItems(Array.isArray(json.items) ? json.items : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "failed_to_load_bookings");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void fetchBookings(windowFilter);
  }, [windowFilter, fetchBookings]);

  const submitCreate = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const payload = {
        title: form.title.trim(),
        attendee: form.attendee.trim() || undefined,
        ts: form.ts ? new Date(form.ts).toISOString() : undefined,
        source: "dashboard",
      };
      const res = await apiFetch("/bookings/create", {
        method: "POST",
        body: JSON.stringify(payload),
        cache: "no-store",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `bookings_create_${res.status}`);
      }
      setForm({ title: "", attendee: "", ts: "" });
      await fetchBookings(windowFilter);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "failed_to_create_booking");
    } finally {
      setCreating(false);
    }
  };

  const cancelBooking = async (booking: BookingItem) => {
    setCancelingId(booking.id);
    try {
      const res = await apiFetch("/bookings/cancel", {
        method: "POST",
        body: JSON.stringify({ id: booking.id, ts: booking.ts }),
        cache: "no-store",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `bookings_cancel_${res.status}`);
      }
      await fetchBookings(windowFilter);
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed_to_cancel_booking");
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <section>
      <h1 className="text-xl font-semibold tracking-tight">Appointments</h1>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-white/70">Window</span>
          <select
            value={windowFilter}
            onChange={(e) => setWindowFilter(e.target.value as typeof windowFilter)}
            className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            <option value="day">Today</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
          </select>
        </label>
        <button
          type="button"
          className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:text-white disabled:opacity-40"
          onClick={() => void fetchBookings(windowFilter)}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          Failed to load appointments. {error}
        </div>
      ) : null}

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5">
        <div className="flex items-center justify-between p-4">
          <h2 className="font-medium">Upcoming</h2>
          <span className="text-xs text-white/60">
            {items.length} appointments{loading ? " (loading…)" : ""}
          </span>
        </div>
        <div className="px-4 pb-4 space-y-3">
          {loading && items.length === 0 ? (
            <div className="space-y-2" aria-hidden>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded border border-white/10 p-3">
                  <div className="skeleton skeleton-line w-40" />
                  <div className="mt-1 skeleton skeleton-line w-52" />
                  <div className="mt-1 skeleton skeleton-line w-32" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-sm text-white/60">No appointments in this window.</div>
          ) : (
            items.map((booking) => (
              <div key={booking.id} className="rounded border border-white/10 p-3 text-sm text-white/80">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium">{booking.title}</div>
                  <div className="text-xs text-white/60">{booking.status ?? "—"}</div>
                </div>
                <div className="mt-1 text-white/70">{formatTimestamp(booking.ts)}</div>
                {booking.attendee ? <div className="text-xs text-white/60">Attendee: {booking.attendee}</div> : null}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded bg-white/10 px-2 py-1 text-xs text-white/60">Source: {booking.source ?? "agent"}</span>
                  {booking.notes ? <span className="text-xs text-white/60">Notes: {booking.notes}</span> : null}
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => void cancelBooking(booking)}
                    className="rounded border border-white/20 px-3 py-1 text-xs text-white/80 hover:text-white disabled:opacity-40"
                    disabled={cancelingId === booking.id}
                  >
                    {cancelingId === booking.id ? "Cancelling…" : "Cancel"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 className="font-medium">Create appointment</h2>
        <form className="mt-3 space-y-3" onSubmit={submitCreate}>
          <div>
            <label className="block text-xs text-white/60" htmlFor="appt-title">
              Title
            </label>
            <input
              id="appt-title"
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="mt-1 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
          <div>
            <label className="block text-xs text-white/60" htmlFor="appt-attendee">
              Attendee
            </label>
            <input
              id="appt-attendee"
              type="text"
              value={form.attendee}
              onChange={(e) => setForm((prev) => ({ ...prev, attendee: e.target.value }))}
              className="mt-1 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="Optional (name, phone, or email)"
            />
          </div>
          <div>
            <label className="block text-xs text-white/60" htmlFor="appt-when">
              When
            </label>
            <input
              id="appt-when"
              type="datetime-local"
              required
              value={form.ts}
              onChange={(e) => setForm((prev) => ({ ...prev, ts: e.target.value }))}
              className="mt-1 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
          {createError ? <div className="text-xs text-red-300">Error: {createError}</div> : null}
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-40"
              disabled={creating}
            >
              {creating ? "Creating…" : "Create appointment"}
            </button>
            <button
              type="button"
              className="rounded border border-white/20 px-4 py-2 text-sm text-white/80 hover:text-white"
              onClick={() => setForm({ title: "", attendee: "", ts: "" })}
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
