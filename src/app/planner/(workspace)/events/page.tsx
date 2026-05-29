"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  CircleDollarSign,
  Filter,
  PiggyBank,
  TrendingUp,
  Users,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { PlannerCreateEventForm } from "@/modules/planner/subscription/PlannerCreateEventForm";
import {
  EventLifecycleStage,
  getPlannerEvents,
  PlannerEventListItem,
} from "@/shared/lib/api/planner";
import { ErrorBanner } from "@/modules/planner/components/ui";
import {
  Badge,
  Button,
  EmptyState,
  PageHeader,
  PageLoadingSkeleton,
  SectionCard,
  StatCard,
  formatLKR,
} from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";

type StatusFilter = "all" | "Active" | "OnHold" | "Completed" | "Archived";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "Active", label: "Active" },
  { value: "OnHold", label: "On hold" },
  { value: "Completed", label: "Completed" },
  { value: "Archived", label: "Archived" },
];

const LIFECYCLE_VARIANT: Record<
  EventLifecycleStage,
  "default" | "accent" | "muted" | "destructive"
> = {
  Lead: "muted",
  Onboarding: "accent",
  Planning: "default",
  Execution: "default",
  Archived: "muted",
};

function daysUntilWedding(eventDate: string): number {
  return Math.ceil(
    (new Date(eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

function budgetUtilization(spent: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((spent / total) * 100));
}

export default function PlannerEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<PlannerEventListItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
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
    void fetchEvents();
  }, [fetchEvents]);

  const totals = useMemo(
    () =>
      events.reduce(
        (acc, item) => {
          acc.totalBudget += item.totalBudget;
          acc.totalSpent += item.spentBudget;
          if (item.status === "Active") acc.active += 1;
          return acc;
        },
        { totalBudget: 0, totalSpent: 0, active: 0 }
      ),
    [events]
  );

  const portfolioUtilization = budgetUtilization(totals.totalSpent, totals.totalBudget);

  const scrollToCreate = () => {
    document.getElementById("create-event")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading && events.length === 0) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-8 pb-4">
      <PageHeader
        title="Wedding events"
        description="Create client weddings, track budgets and bookings, and open each event hub for day-to-day planning."
        badge="Portfolio"
        action={
          <Button type="button" size="sm" onClick={scrollToCreate}>
            <CalendarPlus size={16} aria-hidden />
            New event
          </Button>
        }
      />

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Events shown"
          value={events.length}
          sub={totals.active > 0 ? `${totals.active} active` : undefined}
          icon={Users}
          iconTheme="primary"
          index={0}
        />
        <StatCard
          label="Portfolio budget"
          value={formatLKR(totals.totalBudget)}
          icon={PiggyBank}
          iconTheme="accent"
          index={1}
        />
        <StatCard
          label="Total spent"
          value={formatLKR(totals.totalSpent)}
          icon={CircleDollarSign}
          iconTheme="rose"
          index={2}
        />
        <StatCard
          label="Budget utilization"
          value={`${portfolioUtilization}%`}
          icon={TrendingUp}
          iconTheme="success"
          index={3}
        />
      </div>

      <SectionCard
        title="Wedding portfolio"
        subtitle="Filter by operational status · open any event for tasks, budget, and team"
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            <Filter size={14} className="text-muted-foreground" aria-hidden />
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-200",
                  statusFilter === f.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
                aria-pressed={statusFilter === f.value}
              >
                {f.label}
              </button>
            ))}
          </div>
        }
      >
        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Refreshing events…</p>
        ) : events.length === 0 ? (
          <EmptyState
            title="No weddings in this view"
            description={
              statusFilter === "all"
                ? "Create your first client event below to start managing budgets and bookings."
                : `No events with status “${statusFilter}”. Try another filter or create a new event.`
            }
            action={
              <Button type="button" size="sm" onClick={scrollToCreate}>
                <CalendarPlus size={16} aria-hidden />
                Create event
              </Button>
            }
            className="border-0 bg-transparent shadow-none"
          />
        ) : (
          <ul className="space-y-4" role="list">
            {events.map((event) => {
              const stage = (event.eventLifecycleStage ?? "Planning") as EventLifecycleStage;
              const utilization = budgetUtilization(event.spentBudget, event.totalBudget);
              const days = daysUntilWedding(event.eventDate);

              return (
                <li
                  key={event.plannerClientEventId}
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
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays size={14} aria-hidden />
                            {new Date(event.eventDate).toLocaleDateString(undefined, {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span aria-hidden>·</span>
                          <span className="truncate">{event.clientEmail || "No client email"}</span>
                        </p>
                        <p className="mt-1 text-xs font-medium text-muted-foreground">
                          {days > 0
                            ? `${days} days until wedding`
                            : days === 0
                              ? "Wedding day"
                              : `${Math.abs(days)} days ago`}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="status" status={event.status}>
                        {event.status}
                      </Badge>
                      <Badge variant={LIFECYCLE_VARIANT[stage]} className="normal-case tracking-normal">
                        {stage}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-muted-foreground">Budget spent</span>
                      <span className="font-semibold tabular-nums text-foreground">
                        {formatLKR(event.spentBudget)}
                        <span className="font-normal text-muted-foreground">
                          {" "}
                          / {formatLKR(event.totalBudget)} ({utilization}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          utilization >= 90
                            ? "bg-destructive"
                            : utilization >= 70
                              ? "bg-warning"
                              : "bg-primary"
                        )}
                        style={{ width: `${Math.max(utilization, 4)}%` }}
                        role="progressbar"
                        aria-valuenow={utilization}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${utilization}% of budget spent`}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="muted" className="normal-case tracking-normal">
                      Pending {event.requestedBookings}
                    </Badge>
                    <Badge variant="default" className="normal-case tracking-normal">
                      Confirmed {event.confirmedBookings}
                    </Badge>
                    <Badge variant="accent" className="normal-case tracking-normal">
                      Completed {event.completedBookings}
                    </Badge>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                    <Button href={`/events/${event.eventId}`} size="sm">
                      Open event
                      <ArrowRight size={14} aria-hidden />
                    </Button>
                    <Button href={`/events/${event.eventId}/budget`} variant="secondary" size="sm">
                      Budget
                    </Button>
                    <Button href={`/events/${event.eventId}/team`} variant="secondary" size="sm">
                      Team
                    </Button>
                    <Button href="/planner/tasks" variant="ghost" size="sm">
                      Timeline
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      <div id="create-event" className="scroll-mt-6">
        <SectionCard
          title="Create new client event"
          subtitle="Link a registered couple by email and set the wedding date and budget"
        >
          <PlannerCreateEventForm onCreated={() => void fetchEvents()} />
        </SectionCard>
      </div>
    </div>
  );
}
