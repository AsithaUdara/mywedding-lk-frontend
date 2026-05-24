"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarPlus, Filter, PiggyBank, TrendingDown } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { createPlannerEvent, getPlannerEvents, PlannerEventListItem } from "@/shared/lib/api/planner";
import {
  ErrorBanner,
  formatLKR,
  inputClass,
  LoadingState,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/modules/planner/components/ui";

const DEFAULT_FORM = {
  eventName: "",
  eventDate: "",
  totalBudget: 0,
  clientEmail: "",
};

export default function PlannerEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<PlannerEventListItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "Active" | "OnHold" | "Completed" | "Archived">("all");
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const data = await getPlannerEvents(token, statusFilter === "all" ? undefined : statusFilter);
      setEvents(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events.");
    } finally {
      setLoading(false);
    }
  }, [user, statusFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const totals = useMemo(
    () =>
      events.reduce(
        (acc, item) => {
          acc.totalBudget += item.totalBudget;
          acc.totalSpent += item.spentBudget;
          return acc;
        },
        { totalBudget: 0, totalSpent: 0 }
      ),
    [events]
  );

  const onCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setCreating(true);
      const token = await user.getIdToken();
      await createPlannerEvent(token, form);
      setForm(DEFAULT_FORM);
      await fetchEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className="space-y-8">
      <PageHeader
        title="Events"
        description="Create and manage all client weddings from one place."
        badge={`${events.length} shown`}
      />

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-6 sm:grid-cols-2">
        <StatCard
          index={0}
          label="Total Budget"
          value={formatLKR(totals.totalBudget)}
          icon={<PiggyBank size={22} />}
          color="bg-gradient-to-br from-primary to-primary/80"
        />
        <StatCard
          index={1}
          label="Total Spent"
          value={formatLKR(totals.totalSpent)}
          sub={
            totals.totalBudget > 0
              ? `${Math.round((totals.totalSpent / totals.totalBudget) * 100)}% of portfolio`
              : undefined
          }
          icon={<TrendingDown size={22} />}
          color="bg-gradient-to-br from-rose-500 to-pink-600"
        />
      </div>

      <SectionCard
        title="Wedding portfolio"
        subtitle="Filter by lifecycle status"
        action={
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Filter size={14} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="bg-transparent text-sm font-medium outline-none"
            >
              <option value="all">All statuses</option>
              <option value="Active">Active</option>
              <option value="OnHold">On hold</option>
              <option value="Completed">Completed</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        }
      >
        {loading ? (
          <LoadingState label="Loading events…" />
        ) : events.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
            No client weddings found. Create one below to get started.
          </p>
        ) : (
          <div className="space-y-4">
            {events.map((event, i) => (
              <motion.div
                key={event.plannerClientEventId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-slate-100 bg-slate-50/40 p-5 transition hover:border-primary/20 hover:shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-lg font-bold text-primary shadow-sm">
                      {event.eventName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-charcoal">{event.eventName}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(event.eventDate).toLocaleDateString(undefined, {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        · {event.clientEmail || "No client email"}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={event.status} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-lg bg-white px-3 py-1.5 font-medium text-slate-600 shadow-sm">
                    Budget {formatLKR(event.totalBudget)}
                  </span>
                  <span className="rounded-lg bg-white px-3 py-1.5 font-medium text-slate-600 shadow-sm">
                    Spent {formatLKR(event.spentBudget)}
                  </span>
                  <span className="rounded-lg bg-amber-50 px-3 py-1.5 font-medium text-amber-800">
                    Pending {event.requestedBookings}
                  </span>
                  <span className="rounded-lg bg-blue-50 px-3 py-1.5 font-medium text-blue-800">
                    Confirmed {event.confirmedBookings}
                  </span>
                  <span className="rounded-lg bg-emerald-50 px-3 py-1.5 font-medium text-emerald-800">
                    Done {event.completedBookings}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/events/${event.eventId}`}
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-primary/25"
                  >
                    Open event
                  </Link>
                  <Link
                    href={`/events/${event.eventId}/budget`}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:border-primary/30"
                  >
                    Budget
                  </Link>
                  <Link
                    href={`/events/${event.eventId}/team`}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:border-primary/30"
                  >
                    Team
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Create new client event" subtitle="Link a couple and set the wedding budget">
        <form onSubmit={onCreateEvent} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              required
              placeholder="Event name"
              value={form.eventName}
              onChange={(e) => setForm((f) => ({ ...f, eventName: e.target.value }))}
              className={inputClass}
            />
            <input
              required
              type="date"
              value={form.eventDate}
              onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
              className={inputClass}
            />
            <input
              required
              type="number"
              min={0}
              placeholder="Total budget (LKR)"
              value={form.totalBudget || ""}
              onChange={(e) => setForm((f) => ({ ...f, totalBudget: Number(e.target.value) }))}
              className={inputClass}
            />
            <input
              required
              type="email"
              placeholder="Client email (registered user)"
              value={form.clientEmail}
              onChange={(e) => setForm((f) => ({ ...f, clientEmail: e.target.value }))}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 disabled:opacity-60"
          >
            <CalendarPlus size={18} />
            {creating ? "Creating…" : "Create client event"}
          </button>
        </form>
      </SectionCard>
    </section>
  );
}
