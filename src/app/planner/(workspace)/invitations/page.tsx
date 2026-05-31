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
import { EmptyState, PageLoadingSkeleton } from "@/shared/components/ui";
import {
  GlassButton,
  GlassPageHeader,
  GlassSectionCard,
  GlassStatCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

type InboxFilter = "all" | "active" | "awaiting";

const INBOX_FILTERS: { value: InboxFilter; label: string }[] = [
  { value: "all", label: "All events" },
  { value: "active", label: "Active only" },
  { value: "awaiting", label: "Awaiting vendor" },
];

const INBOX_STEPS = [
  {
    step: "1",
    body: (
      <>
        Shortlist vendors from the <span className="font-medium text-foreground">directory</span>{" "}
        and send an inquiry with wedding details for your client.
      </>
    ),
  },
  {
    step: "2",
    body: (
      <>
        The vendor receives it in their <span className="font-medium text-foreground">CRM inbox</span>{" "}
        and can reply with a quote.
      </>
    ),
  },
  {
    step: "3",
    body: (
      <>
        Track pending and confirmed vendors here, then finalize on{" "}
        <span className="font-medium text-foreground">Bookings</span>.
      </>
    ),
  },
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
    <div className="space-y-6 pb-4 md:space-y-8">
      <GlassPageHeader
        title="Inbox"
        description="Vendor inquiries and quotes for your client weddings — the same conversations vendors manage in their CRM inbox."
        badge="Inbox"
        action={
          <GlassButton href="/vendors" variant="primary" className="gap-1.5">
            <Store size={16} aria-hidden />
            Browse vendors
          </GlassButton>
        }
      />

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassStatCard
          label="Awaiting vendor"
          value={totals.pending}
          sub={totals.eventsAwaiting > 0 ? `${totals.eventsAwaiting} weddings` : "No pending replies"}
          icon={Clock}
          iconTheme="warning"
        />
        <GlassStatCard
          label="Confirmed"
          value={totals.confirmed}
          sub="Vendor bookings locked"
          icon={CheckCircle2}
          iconTheme="primary"
        />
        <GlassStatCard
          label="Completed"
          value={totals.completed}
          sub="Services delivered"
          icon={Inbox}
          iconTheme="success"
        />
        <GlassStatCard
          label="Events in view"
          value={events.length}
          sub="In current filter"
          icon={CalendarDays}
          iconTheme="muted"
        />
      </div>

      <GlassSectionCard title="How your inbox works" subtitle="Planner and vendor sides stay in sync">
        <ol className="grid gap-3 sm:grid-cols-3">
          {INBOX_STEPS.map((item) => (
            <li
              key={item.step}
              className={cn(
                "rounded-xl border border-white/55 bg-white/35 px-4 py-3 backdrop-blur-sm",
                vg.subtitle
              )}
            >
              <span className="font-bold text-primary">{item.step}.</span> {item.body}
            </li>
          ))}
        </ol>
      </GlassSectionCard>

      <GlassSectionCard
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
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                  inboxFilter === f.value
                    ? "vgo-nav-active"
                    : "vgo-nav-idle rf-glass-subtle vgo-glass-subtle"
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
          <p className={cn("py-8 text-center", vg.subtitle)}>Refreshing inbox…</p>
        ) : events.length === 0 ? (
          <EmptyState
            title="No weddings in this view"
            description="Create a client event, then inquire with vendors on their behalf."
            action={
              <GlassButton href="/planner/dashboard#create-event-dashboard" variant="primary">
                Create event
              </GlassButton>
            }
            className="border-0 bg-transparent shadow-none"
          />
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            title="No vendor inquiries pending"
            description="All vendor conversations in this view have moved forward. Browse vendors to send a new inquiry."
            action={
              <GlassButton href="/vendors" variant="primary" className="gap-1.5">
                <Store size={16} aria-hidden />
                Browse vendors
              </GlassButton>
            }
            className="border-0 bg-transparent shadow-none"
          />
        ) : (
          <ul className="space-y-4" role="list">
            {filteredEvents.map((event) => {
              const total = bookingTotal(event);
              const resolved = event.confirmedBookings + event.completedBookings;
              const progressPct = total > 0 ? Math.round((resolved / total) * 100) : 0;

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
                        <GlassButton href="/vendors" variant="ghost" className="gap-1">
                          <Store size={14} aria-hidden />
                          Find vendors
                        </GlassButton>
                        <GlassButton href="/planner/bookings" variant="primary" className="gap-1">
                          Bookings
                          <ArrowRight size={14} aria-hidden />
                        </GlassButton>
                      </div>
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
                        Awaiting vendor {event.requestedBookings}
                      </span>
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-primary/15">
                        Confirmed {event.confirmedBookings}
                      </span>
                      <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent ring-1 ring-accent/15">
                        Completed {event.completedBookings}
                      </span>
                    </div>

                    {total > 0 && (
                      <div className="mt-4 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className={vg.caption}>Vendor pipeline</span>
                          <span className="font-semibold tabular-nums text-foreground">
                            {progressPct}% confirmed or done
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/50 ring-1 ring-white/60">
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
