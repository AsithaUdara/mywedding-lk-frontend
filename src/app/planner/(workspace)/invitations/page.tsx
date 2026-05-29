"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Inbox,
  Store,
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
  SectionCard,
  StatCard,
} from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";

type InboxFilter = "all" | "active" | "awaiting";

const INBOX_FILTERS: { value: InboxFilter; label: string }[] = [
  { value: "all", label: "All events" },
  { value: "active", label: "Active only" },
  { value: "awaiting", label: "Awaiting vendor" },
];

function bookingTotal(event: PlannerEventListItem): number {
  return event.requestedBookings + event.confirmedBookings + event.completedBookings;
}

export default function PlannerInvitationsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<PlannerEventListItem[]>([]);
  const [inboxFilter, setInboxFilter] = useState<InboxFilter>("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const statusQuery = inboxFilter === "active" ? "Active" : undefined;
      const data = await getPlannerEvents(token, statusQuery);
      setEvents(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inbox.");
    } finally {
      setLoading(false);
    }
  }, [user, inboxFilter]);

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
          if (e.requestedBookings > 0) acc.eventsAwaiting += 1;
          return acc;
        },
        { pending: 0, confirmed: 0, completed: 0, eventsAwaiting: 0 }
      ),
    [events]
  );

  const filteredEvents = useMemo(() => {
    let list = [...events];
    if (inboxFilter === "awaiting") {
      list = list.filter((e) => e.requestedBookings > 0);
    }
    return list.sort((a, b) => b.requestedBookings - a.requestedBookings);
  }, [events, inboxFilter]);

  if (loading && events.length === 0) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-8 pb-4">
      <PageHeader
        title="Inbox"
        description="Vendor inquiries and quotes for your client weddings — the same conversations vendors manage in their CRM inbox."
        badge="Inbox"
        action={
          <Button href="/vendors" size="sm">
            <Store size={16} aria-hidden />
            Browse vendors
          </Button>
        }
      />

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Awaiting vendor"
          value={totals.pending}
          sub={
            totals.eventsAwaiting > 0 ? `${totals.eventsAwaiting} weddings` : undefined
          }
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
          icon={Inbox}
          iconTheme="success"
          index={2}
        />
        <StatCard
          label="Events in view"
          value={events.length}
          icon={CalendarDays}
          iconTheme="muted"
          index={3}
        />
      </div>

      <SectionCard
        title="How your inbox works"
        subtitle="Planner and vendor sides stay in sync"
      >
        <ol className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
          <li className="rounded-2xl border border-border bg-muted/30 px-4 py-3">
            <span className="font-bold text-primary">1.</span> Shortlist vendors from the{" "}
            <span className="font-semibold text-foreground">directory</span> and send an inquiry
            with wedding details for your client.
          </li>
          <li className="rounded-2xl border border-border bg-muted/30 px-4 py-3">
            <span className="font-bold text-primary">2.</span> The vendor receives it in their{" "}
            <span className="font-semibold text-foreground">CRM inbox</span> and can reply with a
            quote.
          </li>
          <li className="rounded-2xl border border-border bg-muted/30 px-4 py-3">
            <span className="font-bold text-primary">3.</span> Track pending and confirmed vendors
            here, then finalize on{" "}
            <span className="font-semibold text-foreground">Bookings</span>.
          </li>
        </ol>
      </SectionCard>

      <SectionCard
        title="By wedding"
        subtitle="Sorted by vendor inquiries still awaiting a response"
        action={
          <div className="flex flex-wrap gap-1.5">
            {INBOX_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setInboxFilter(f.value)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-200",
                  inboxFilter === f.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
                aria-pressed={inboxFilter === f.value}
              >
                {f.label}
              </button>
            ))}
          </div>
        }
      >
        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Refreshing inbox…</p>
        ) : events.length === 0 ? (
          <EmptyState
            title="No weddings in this view"
            description="Create a client event, then inquire with vendors on their behalf."
            action={
              <Button href="/planner/events" size="sm">
                Create event
              </Button>
            }
            className="border-0 bg-transparent shadow-none"
          />
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            title="No vendor inquiries pending"
            description="All vendor conversations in this view have moved forward. Browse vendors to send a new inquiry."
            action={
              <Button href="/vendors" size="sm">
                <Store size={16} aria-hidden />
                Browse vendors
              </Button>
            }
            className="border-0 bg-transparent shadow-none"
          />
        ) : (
          <ul className="space-y-4" role="list">
            {filteredEvents.map((event) => {
              const total = bookingTotal(event);
              const resolved = event.confirmedBookings + event.completedBookings;
              const progressPct =
                total > 0 ? Math.round((resolved / total) * 100) : 0;

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
                          {total === 0
                            ? "No vendor inquiries yet"
                            : `${total} vendor conversation${total === 1 ? "" : "s"}`}
                          {event.requestedBookings > 0 && (
                            <span className="text-warning"> · awaiting reply</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button href="/vendors" size="sm">
                        <Store size={14} aria-hidden />
                        Find vendors
                      </Button>
                      <Button href="/planner/bookings" variant="secondary" size="sm">
                        Bookings
                        <ArrowRight size={14} aria-hidden />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge
                      variant="muted"
                      className={cn(
                        "normal-case tracking-normal",
                        event.requestedBookings > 0 &&
                          "border-warning/40 bg-warning/10 text-warning"
                      )}
                    >
                      Awaiting vendor {event.requestedBookings}
                    </Badge>
                    <Badge variant="default" className="normal-case tracking-normal">
                      Confirmed {event.confirmedBookings}
                    </Badge>
                    <Badge variant="accent" className="normal-case tracking-normal">
                      Completed {event.completedBookings}
                    </Badge>
                  </div>

                  {total > 0 && (
                    <div className="mt-4 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-muted-foreground">
                          Vendor pipeline
                        </span>
                        <span className="font-semibold tabular-nums text-foreground">
                          {progressPct}% confirmed or done
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-300"
                          style={{ width: `${Math.max(progressPct, resolved > 0 ? 4 : 0)}%` }}
                          role="progressbar"
                          aria-valuenow={progressPct}
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
