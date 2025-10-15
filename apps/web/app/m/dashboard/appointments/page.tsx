"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/http";
import { MobileCard, MobileCardContent, MobileCardFooter, MobileCardHeader } from "@/components/mobile/Card";
import MobileSheet from "@/components/mobile/Sheet";

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
};

type CreateForm = {
  title: string;
  attendee: string;
  ts: string;
};

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return "—";
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function MobileAppointmentsPage() {
  const [windowFilter, setWindowFilter] = useState<"day" | "week" | "month">("week");
  const [items, setItems] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>({ title: "", attendee: "", ts: "" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const fetchAppointments = useCallback(
    async (windowValue: "day" | "week" | "month") => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch(`/bookings/list?window=${windowValue}`, { cache: "no-store" });
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
    void fetchAppointments(windowFilter);
  }, [fetchAppointments, windowFilter]);

  const submitCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const payload = {
        title: createForm.title.trim(),
        attendee: createForm.attendee.trim() || undefined,
        ts: createForm.ts ? new Date(createForm.ts).toISOString() : undefined,
        source: "mobile",
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
      setCreateForm({ title: "", attendee: "", ts: "" });
      setCreateOpen(false);
      await fetchAppointments(windowFilter);
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
        cache: "no-store",
        body: JSON.stringify({ id: booking.id, ts: booking.ts }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `bookings_cancel_${res.status}`);
      }
      await fetchAppointments(windowFilter);
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed_to_cancel_booking");
    } finally {
      setCancelingId(null);
    }
  };

  const openDesktopAction = (booking: BookingItem, action: "confirm" | "reschedule") => {
    const url = `/dashboard/appointments?booking=${encodeURIComponent(booking.id)}&action=${action}`;
    window.location.href = url;
  };

  return (
    <>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6 text-white">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Appointments</h1>
            <p className="text-sm text-white/60">Keep upcoming meetings on track.</p>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-11 items-center justify-center rounded-full bg-white px-4 text-sm font-semibold text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
          >
            New
          </button>
        </header>

        <div className="flex gap-2">
          {["day", "week", "month"].map((value) => {
            const typedValue = value as "day" | "week" | "month";
            const active = windowFilter === typedValue;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setWindowFilter(typedValue)}
                className={`inline-flex flex-1 items-center justify-center rounded-full border px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                  active ? "border-white/20 bg-white/10 text-white" : "border-white/15 text-white/70"
                }`}
              >
                {typedValue === "day" ? "Today" : typedValue === "week" ? "This week" : "This month"}
              </button>
            );
          })}
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            Failed to load appointments. {error.replace(/_/g, " ")}
          </div>
        ) : null}

        <div className="space-y-3">
          {loading && items.length === 0
            ? Array.from({ length: 3 }).map((_, idx) => (
                <MobileCard key={idx}>
                  <div className="space-y-2" aria-hidden>
                    <div className="skeleton skeleton-line w-40" />
                    <div className="skeleton skeleton-line w-32" />
                    <div className="skeleton skeleton-line w-24" />
                  </div>
                </MobileCard>
              ))
            : null}

          {items.map((booking) => (
            <MobileCard key={booking.id}>
              <MobileCardHeader
                title={booking.title || "Untitled"}
                subtitle={booking.status ? booking.status : "Scheduled"}
              />
              <MobileCardContent>
                <div className="text-base text-white/80">{formatTimestamp(booking.ts)}</div>
                {booking.attendee ? (
                  <div className="mt-2 text-sm text-white/60">Attendee: {booking.attendee}</div>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/60">
                  <span className="rounded-full border border-white/15 px-2 py-1">Source: {booking.source ?? "agent"}</span>
                  {booking.notes ? (
                    <span className="rounded-full border border-white/15 px-2 py-1">Notes: {booking.notes}</span>
                  ) : null}
                </div>
              </MobileCardContent>
              <MobileCardFooter>
                <button
                  type="button"
                  onClick={() => openDesktopAction(booking, "confirm")}
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-white/20 px-3 py-2 text-sm text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => openDesktopAction(booking, "reschedule")}
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-white/20 px-3 py-2 text-sm text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  Reschedule
                </button>
                <button
                  type="button"
                  onClick={() => void cancelBooking(booking)}
                  disabled={cancelingId === booking.id}
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-white/20 px-3 py-2 text-sm text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:opacity-40"
                >
                  {cancelingId === booking.id ? "Cancelling…" : "Cancel"}
                </button>
              </MobileCardFooter>
            </MobileCard>
          ))}

          {!loading && items.length === 0 ? (
            <p className="text-sm text-white/60">No appointments in this window.</p>
          ) : null}
        </div>
      </div>

      <MobileSheet open={createOpen} onClose={() => setCreateOpen(false)} title="New appointment">
        <form className="flex flex-col gap-4" onSubmit={submitCreate}>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-white/70">Title</span>
            <input
              value={createForm.title}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, title: e.target.value }))}
              required
              className="h-12 rounded-xl border border-white/15 bg-white/5 px-3 text-white placeholder-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              placeholder="Consultation call"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-white/70">Attendee email</span>
            <input
              value={createForm.attendee}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, attendee: e.target.value }))}
              type="email"
              className="h-12 rounded-xl border border-white/15 bg-white/5 px-3 text-white placeholder-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              placeholder="customer@example.com"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-white/70">Start time</span>
            <input
              value={createForm.ts}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, ts: e.target.value }))}
              type="datetime-local"
              className="h-12 rounded-xl border border-white/15 bg-white/5 px-3 text-white placeholder-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              required
            />
          </label>
          {createError ? <p className="text-sm text-red-300">{createError.replace(/_/g, " ")}</p> : null}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-white/20 px-6 text-sm font-medium text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 disabled:opacity-40"
            >
              {creating ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </MobileSheet>
    </>
  );
}
