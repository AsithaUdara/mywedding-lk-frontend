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
import { ErrorBanner } from "@/modules/planner/components/ui";
import {
  Badge,
  Button,
  EmptyState,
  PageHeader,
  PageLoadingSkeleton,
  ProgressBar,
  SectionCard,
  StatCard,
} from "@/shared/components/ui";
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
    <div className="space-y-8 pb-4">
      <PageHeader
        title="Bookings & payments"
        description="Track vendor request pipelines and fulfillment progress across every wedding you manage."
        badge="Operations"
        action={
          <div className="flex flex-wrap gap-2">
            <Button href="/planner/procurement" variant="primary" size="sm">
              <ClipboardCheck size={16} aria-hidden />
              Procurement
            </Button>
            <Button href="/planner/events" variant="secondary" size="sm">
              <CalendarDays size={16} aria-hidden />
              View events
            </Button>
          </div>
        }
      />

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Pending requests"
          value={totals.pending}
          sub={eventsNeedingAction > 0 ? `${eventsNeedingAction} events` : undefined}
          icon={Clock}
          iconTheme="warning"
          index={0}
        />
        <StatCard
          label="Confirmed"
          value={totals.confirmed}
          icon={CheckCircle2}
          iconTheme="primary"
          index={1}
        />
        <StatCard
          label="Completed"
          value={totals.completed}
          icon={PartyPopper}
          iconTheme="success"
          index={2}
        />
        <StatCard
          label="Confirm rate"
          value={`${confirmRate}%`}
          icon={TrendingUp}
          iconTheme="accent"
          index={3}
        />
      </div>

      <SectionCard
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
      </SectionCard>

      <SectionCard
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
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-200",
                  bookingFilter === f.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:text-foreground"
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
          <p className="py-8 text-center text-sm text-muted-foreground">Refreshing bookings…</p>
        ) : events.length === 0 ? (
          <EmptyState
            title="No booking activity yet"
            description="Bookings appear when clients request vendors on weddings you manage."
            action={
              <Button href="/planner/events" size="sm">
                <ClipboardCheck size={16} aria-hidden />
                Manage events
              </Button>
            }
            className="border-0 bg-transparent shadow-none"
          />
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            title="No events match this filter"
            description="Try “All events” or check weddings that still have pending vendor requests."
            action={
              <Button type="button" size="sm" onClick={() => setBookingFilter("all")}>
                Show all events
              </Button>
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
                <li
                  key={event.eventId}
                  className="rounded-2xl border border-border bg-background/80 p-5 transition-all duration-200 hover:border-primary/25 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-4">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 font-playfair text-lg font-bold text-primary"
                        aria-hidden
                      >
                        {event.eventName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-foreground">
                          {event.eventName}
                        </h3>
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">
                          {event.clientEmail || "No client email"}
                        </p>
                        <p className="mt-1 text-xs font-medium text-muted-foreground">
                          {total} booking{total === 1 ? "" : "s"} tracked
                          {event.requestedBookings > 0 && (
                            <span className="text-warning"> · action needed</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <Button href={`/events/${event.eventId}`} size="sm">
                      Open event
                      <ArrowRight size={14} aria-hidden />
                    </Button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge
                      variant="muted"
                      className={cn(
                        "normal-case tracking-normal",
                        event.requestedBookings > 0 && "border-warning/40 bg-warning/10 text-warning"
                      )}
                    >
                      Pending {event.requestedBookings}
                    </Badge>
                    <Badge variant="default" className="normal-case tracking-normal">
                      Confirmed {event.confirmedBookings}
                    </Badge>
                    <Badge variant="accent" className="normal-case tracking-normal">
                      Completed {event.completedBookings}
                    </Badge>
                    {event.status && (
                      <Badge variant="status" status={event.status}>
                        {event.status}
                      </Badge>
                    )}
                  </div>

                  {total > 0 && (
                    <div className="mt-4 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-muted-foreground">Pending share</span>
                        <span className="font-semibold tabular-nums text-foreground">
                          {pendingPct}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-warning transition-all duration-300"
                          style={{ width: `${Math.max(pendingPct, event.requestedBookings > 0 ? 4 : 0)}%` }}
                          role="progressbar"
                          aria-valuenow={pendingPct}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
