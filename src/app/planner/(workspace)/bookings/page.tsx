"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, ClipboardCheck, Clock, PartyPopper } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { getPlannerEvents, PlannerEventListItem } from "@/shared/lib/api/planner";
import { PlannerBookingsTable } from "@/modules/planner/PlannerBookingsTable";
import { ErrorBanner, StatusBadge } from "@/modules/planner/components/ui";
import { EmptyState, PageLoadingSkeleton } from "@/shared/components/ui";
import { GlassButton, GlassPageHeader, GlassSectionCard, GlassStatCard } from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

type ViewTab = "bookings" | "events";

const VIEW_TABS: { value: ViewTab; label: string }[] = [
  { value: "bookings", label: "Vendor bookings" },
  { value: "events", label: "By wedding" },
];

type EventFilter = "all" | "attention";

function eventBookingTotal(event: PlannerEventListItem): number {
  return event.requestedBookings + event.confirmedBookings + event.completedBookings;
}

export default function PlannerBookingsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<PlannerEventListItem[]>([]);
  const [view, setView] = useState<ViewTab>("bookings");
  const [eventFilter, setEventFilter] = useState<EventFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const data = await getPlannerEvents(token);
      setEvents(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const totals = useMemo(
    () =>
      events.reduce(
        (acc, e) => {
          acc.pending += e.requestedBookings;
          acc.confirmed += e.confirmedBookings;
          acc.completed += e.completedBookings;
          return acc;
        },
        { pending: 0, confirmed: 0, completed: 0 }
      ),
    [events]
  );

  const confirmRate = useMemo(() => {
    const decided = totals.confirmed + totals.completed;
    if (decided + totals.pending === 0) return 0;
    return Math.round((decided / (decided + totals.pending)) * 100);
  }, [totals]);

  const eventsNeedingAction = useMemo(
    () => events.filter((e) => e.requestedBookings > 0).length,
    [events]
  );

  const filteredEvents = useMemo(() => {
    let list = [...events];
    if (eventFilter === "attention") {
      list = list.filter((e) => e.requestedBookings > 0);
    }
    return list.sort((a, b) => b.requestedBookings - a.requestedBookings);
  }, [events, eventFilter]);

  if (loading && events.length === 0) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-6 pb-4">
      <GlassPageHeader
        title="Bookings"
        description="Vendor requests and payments across your portfolio."
        action={
          <GlassButton href="/planner/procurement" variant="primary" className="gap-1.5">
            <ClipboardCheck size={16} aria-hidden />
            Procurement
          </GlassButton>
        }
      />

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <GlassStatCard
          label="Pending"
          value={totals.pending}
          sub={eventsNeedingAction > 0 ? `${eventsNeedingAction} weddings` : "Awaiting vendor"}
          icon={Clock}
          iconTheme="warning"
        />
        <GlassStatCard
          label="Confirmed"
          value={totals.confirmed}
          sub={`${confirmRate}% confirm rate`}
          icon={CheckCircle2}
          iconTheme="primary"
        />
        <GlassStatCard
          label="Completed"
          value={totals.completed}
          sub="Delivered"
          icon={PartyPopper}
          iconTheme="success"
        />
      </div>

      <GlassSectionCard
        title={view === "bookings" ? "Vendor bookings" : "By wedding"}
        subtitle={
          view === "bookings"
            ? "Sync payment status if a PayHere webhook was missed"
            : "Jump into an event to approve requests"
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            {view === "events" ? (
              <>
                <button
                  type="button"
                  onClick={() => setEventFilter("all")}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    eventFilter === "all"
                      ? "bg-primary text-primary-foreground"
                      : "border border-white/60 bg-white/40 text-foreground hover:bg-white/60"
                  )}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setEventFilter("attention")}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    eventFilter === "attention"
                      ? "bg-primary text-primary-foreground"
                      : "border border-white/60 bg-white/40 text-foreground hover:bg-white/60"
                  )}
                >
                  Needs action
                </button>
              </>
            ) : null}
            <div className="flex rounded-full border border-white/60 bg-white/40 p-0.5">
              {VIEW_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setView(tab.value)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    view === tab.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground hover:bg-white/60"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        }
      >
        {view === "bookings" ? (
          <PlannerBookingsTable />
        ) : loading ? (
          <p className={cn("py-6 text-center", vg.subtitle)}>Loading…</p>
        ) : events.length === 0 ? (
          <EmptyState
            title="No weddings yet"
            description="Booking counts appear when you manage client events."
            action={
              <GlassButton href="/planner/events" variant="primary" className="gap-1.5">
                <CalendarDays size={16} aria-hidden />
                Events
              </GlassButton>
            }
            className="border-0 bg-transparent shadow-none"
          />
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            title="All clear"
            description="No weddings have pending vendor requests right now."
            action={
              <GlassButton type="button" variant="ghost" onClick={() => setEventFilter("all")}>
                Show all weddings
              </GlassButton>
            }
            className="border-0 bg-transparent shadow-none"
          />
        ) : (
          <ul className="divide-y divide-white/50" role="list">
            {filteredEvents.map((event) => {
              const total = eventBookingTotal(event);
              return (
                <li key={event.eventId}>
                  <div className="flex flex-wrap items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className={cn("font-medium", vg.body)}>{event.eventName}</p>
                      <p className={cn("mt-0.5 truncate text-sm", vg.subtitle)}>
                        {event.clientEmail || "No client email"}
                        {total > 0 && (
                          <>
                            {" · "}
                            <span className="text-foreground">
                              {event.requestedBookings} pending · {event.confirmedBookings} confirmed ·{" "}
                              {event.completedBookings} done
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {event.requestedBookings > 0 && (
                        <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-warning">
                          Action
                        </span>
                      )}
                      {event.status && <StatusBadge status={event.status} />}
                      <GlassButton href={`/events/${event.eventId}`} variant="ghost" className="gap-1">
                        Open
                        <ArrowRight size={14} aria-hidden />
                      </GlassButton>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </GlassSectionCard>
    </div>
  );
}
