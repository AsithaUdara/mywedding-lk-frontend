"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  PartyPopper,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { getPlannerEvents, PlannerEventListItem } from "@/shared/lib/api/planner";
import { PlannerBookingsTable } from "@/modules/planner/PlannerBookingsTable";
import { ErrorBanner, ProgressBar, StatusBadge } from "@/modules/planner/components/ui";
import { EmptyState, PageLoadingSkeleton } from "@/shared/components/ui";
import {
  GlassButton,
  GlassPageHeader,
  GlassSectionCard,
  GlassStatCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

type BookingFilter = "all" | "attention" | "clear";

const BOOKING_FILTERS: { value: BookingFilter; label: string }[] = [
  { value: "all", label: "All events" },
  { value: "attention", label: "Needs action" },
  { value: "clear", label: "Pipeline clear" },
];

function eventBookingTotal(event: PlannerEventListItem): number {
  return event.requestedBookings + event.confirmedBookings + event.completedBookings;
}

export default function PlannerBookingsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<PlannerEventListItem[]>([]);
  const [bookingFilter, setBookingFilter] = useState<BookingFilter>("all");
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

  const pipelineTotal = totals.pending + totals.confirmed + totals.completed || 1;

  const confirmRate = useMemo(() => {
    const decided = totals.confirmed + totals.completed;
    if (decided + totals.pending === 0) return 0;
    return Math.round((decided / (decided + totals.pending)) * 100);
  }, [totals]);

  const filteredEvents = useMemo(() => {
    let list = [...events];
    if (bookingFilter === "attention") {
      list = list.filter((e) => e.requestedBookings > 0);
    } else if (bookingFilter === "clear") {
      list = list.filter(
        (e) => e.requestedBookings === 0 && eventBookingTotal(e) > 0
      );
    }
    return list.sort((a, b) => b.requestedBookings - a.requestedBookings);
  }, [events, bookingFilter]);

  const eventsNeedingAction = useMemo(
    () => events.filter((e) => e.requestedBookings > 0).length,
    [events]
  );

  if (loading && events.length === 0) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-6 pb-4 md:space-y-8">
      <GlassPageHeader
        title="Bookings & payments"
        description="Track vendor request pipelines and fulfillment progress across every wedding you manage."
        badge="Operations"
        action={
          <div className="flex flex-wrap gap-2">
            <GlassButton href="/planner/procurement" variant="primary" className="gap-1.5">
              <ClipboardCheck size={16} aria-hidden />
              Procurement
            </GlassButton>
            <GlassButton href="/planner/events" variant="ghost" className="gap-1.5">
              <CalendarDays size={16} aria-hidden />
              View events
            </GlassButton>
          </div>
        }
      />

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassStatCard
          label="Pending requests"
          value={totals.pending}
          sub={eventsNeedingAction > 0 ? `${eventsNeedingAction} events need action` : "Awaiting vendor"}
          icon={Clock}
          iconTheme="warning"
        />
        <GlassStatCard
          label="Confirmed"
          value={totals.confirmed}
          sub="Ready to execute"
          icon={CheckCircle2}
          iconTheme="primary"
        />
        <GlassStatCard
          label="Completed"
          value={totals.completed}
          sub="Services delivered"
          icon={PartyPopper}
          iconTheme="success"
        />
        <GlassStatCard
          label="Confirm rate"
          value={`${confirmRate}%`}
          sub="Confirmed + completed vs pending"
          icon={TrendingUp}
          iconTheme="accent"
        />
      </div>

      <GlassSectionCard
        title="Portfolio pipeline"
        subtitle="Share of booking activity across all managed weddings"
      >
        <div className="space-y-5">
          <ProgressBar
            label="Pending vendor requests"
            count={totals.pending}
            total={pipelineTotal}
            barClassName="bg-warning"
          />
          <ProgressBar
            label="Confirmed bookings"
            count={totals.confirmed}
            total={pipelineTotal}
            barClassName="bg-primary"
          />
          <ProgressBar
            label="Completed services"
            count={totals.completed}
            total={pipelineTotal}
            barClassName="bg-success"
          />
        </div>
      </GlassSectionCard>

      <GlassSectionCard
        title="All bookings"
        subtitle="Sync PayHere payment status when a webhook was missed"
      >
        <PlannerBookingsTable />
      </GlassSectionCard>

      <GlassSectionCard
        title="By wedding"
        subtitle="Open an event to approve requests and manage vendor payments"
        action={
          <div className="flex flex-wrap gap-1.5">
            {BOOKING_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setBookingFilter(f.value)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                  bookingFilter === f.value
                    ? "vgo-nav-active"
                    : "vgo-nav-idle rf-glass-subtle vgo-glass-subtle"
                )}
                aria-pressed={bookingFilter === f.value}
              >
                {f.label}
              </button>
            ))}
          </div>
        }
      >
        {loading ? (
          <p className={cn("py-8 text-center", vg.subtitle)}>Refreshing bookings…</p>
        ) : events.length === 0 ? (
          <EmptyState
            title="No booking activity yet"
            description="Bookings appear when clients request vendors on weddings you manage."
            action={
              <GlassButton href="/planner/events" variant="primary" className="gap-1.5">
                <ClipboardCheck size={16} aria-hidden />
                Manage events
              </GlassButton>
            }
            className="border-0 bg-transparent shadow-none"
          />
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            title="No events match this filter"
            description="Try “All events” or check weddings that still have pending vendor requests."
            action={
              <GlassButton type="button" variant="primary" onClick={() => setBookingFilter("all")}>
                Show all events
              </GlassButton>
            }
            className="border-0 bg-transparent shadow-none"
          />
        ) : (
          <ul className="space-y-4" role="list">
            {filteredEvents.map((event) => {
              const total = eventBookingTotal(event);
              const pendingPct =
                total > 0 ? Math.round((event.requestedBookings / total) * 100) : 0;

              return (
                <li key={event.eventId}>
                  <article
                    className={cn(
                      "rounded-xl border border-white/55 bg-white/40 p-5 backdrop-blur-sm sm:p-6",
                      "transition-all duration-200 hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/55 hover:shadow-[0_4px_20px_hsl(345_100%_25%/0.08)]"
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex min-w-0 gap-4">
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-luxury-display text-lg font-bold text-primary"
                          aria-hidden
                        >
                          {event.eventName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className={cn("truncate font-medium", vg.body)}>{event.eventName}</h3>
                          <p className={cn("mt-0.5 truncate", vg.subtitle)}>
                            {event.clientEmail || "No client email"}
                          </p>
                          <p className={cn("mt-1 font-medium", vg.caption)}>
                            {total} booking{total === 1 ? "" : "s"} tracked
                            {event.requestedBookings > 0 && (
                              <span className="text-warning"> · action needed</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <GlassButton href={`/events/${event.eventId}`} variant="primary" className="gap-1">
                        Open event
                        <ArrowRight size={14} aria-hidden />
                      </GlassButton>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-medium ring-1",
                          event.requestedBookings > 0
                            ? "bg-warning/10 text-warning ring-warning/15"
                            : "bg-white/50 text-muted-foreground ring-white/60"
                        )}
                      >
                        Pending {event.requestedBookings}
                      </span>
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-primary/15">
                        Confirmed {event.confirmedBookings}
                      </span>
                      <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent ring-1 ring-accent/15">
                        Completed {event.completedBookings}
                      </span>
                      {event.status && <StatusBadge status={event.status} />}
                    </div>

                    {total > 0 && (
                      <div className="mt-4 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className={vg.caption}>Pending share</span>
                          <span className="font-semibold tabular-nums text-foreground">
                            {pendingPct}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/50 ring-1 ring-white/60">
                          <div
                            className="h-full rounded-full bg-warning transition-all duration-300"
                            style={{
                              width: `${Math.max(pendingPct, event.requestedBookings > 0 ? 4 : 0)}%`,
                            }}
                            role="progressbar"
                            aria-valuenow={pendingPct}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </div>
                    )}
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </GlassSectionCard>
    </div>
  );
}
