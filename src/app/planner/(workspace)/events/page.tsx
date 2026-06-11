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
import {
  usePlannerCreateEventModal,
  usePlannerEventCreated,
} from "@/modules/planner/subscription/PlannerCreateEventProvider";
import {
  EventLifecycleStage,
  getPlannerEvents,
  PlannerEventListItem,
} from "@/shared/lib/api/planner";
import { ErrorBanner, StatusBadge, formatLKR } from "@/modules/planner/components/ui";
import {
  budgetUsageBarWidth,
  budgetUsagePercent,
  formatPercentDisplay,
} from "@/shared/lib/format";
import { EmptyState, PageLoadingSkeleton } from "@/shared/components/ui";
import {
  GlassButton,
  GlassPageHeader,
  GlassSectionCard,
  GlassStatCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

type StatusFilter = "all" | "Active" | "OnHold" | "Completed" | "Archived";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "Active", label: "Active" },
  { value: "OnHold", label: "On hold" },
  { value: "Completed", label: "Completed" },
  { value: "Archived", label: "Archived" },
];

const LIFECYCLE_PILL: Record<EventLifecycleStage, string> = {
  Lead: "bg-muted/60 text-muted-foreground ring-1 ring-white/60",
  Onboarding: "bg-warning/10 text-warning ring-1 ring-warning/15",
  Planning: "bg-accent/10 text-accent ring-1 ring-accent/15",
  Execution: "bg-primary/10 text-primary ring-1 ring-primary/15",
  Archived: "bg-white/50 text-muted-foreground ring-1 ring-white/60",
};

function daysUntilWedding(eventDate: string): number {
  return Math.ceil(
    (new Date(eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

function budgetUtilization(spent: number, total: number): number {
  return budgetUsagePercent(spent, total);
}

export default function PlannerEventsPage() {
  const { user } = useAuth();
  const { openCreateEventModal } = usePlannerCreateEventModal();
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

  usePlannerEventCreated(fetchEvents);

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

  if (loading && events.length === 0) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-6 pb-4 md:space-y-8">
      <GlassPageHeader
        title="Wedding events"
        description="Create client weddings, track budgets and bookings, and open each event hub for day-to-day planning."
        badge="Portfolio"
        action={
          <GlassButton type="button" variant="primary" className="gap-1.5" onClick={openCreateEventModal}>
            <CalendarPlus size={16} aria-hidden />
            New event
          </GlassButton>
        }
      />

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GlassStatCard
          label="Events shown"
          value={events.length}
          sub={totals.active > 0 ? `${totals.active} active` : "In current filter"}
          icon={Users}
          iconTheme="primary"
        />
        <GlassStatCard
          label="Portfolio budget"
          value={formatLKR(totals.totalBudget)}
          sub="Total allocated"
          icon={PiggyBank}
          iconTheme="accent"
        />
        <GlassStatCard
          label="Total spent"
          value={formatLKR(totals.totalSpent)}
          sub="Across shown events"
          icon={CircleDollarSign}
          iconTheme="warning"
        />
        <GlassStatCard
          label="Budget utilization"
          value={formatPercentDisplay(portfolioUtilization)}
          sub="Spent vs planned"
          icon={TrendingUp}
          iconTheme="success"
        />
      </div>

      <GlassSectionCard
        title="Wedding portfolio"
        subtitle="Filter by operational status · open any event for tasks, budget, and team"
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            <Filter size={14} className="shrink-0 text-muted-foreground" aria-hidden />
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                  statusFilter === f.value
                    ? "vgo-nav-active"
                    : "vgo-nav-idle rf-glass-subtle vgo-glass-subtle"
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
          <p className={cn("py-8 text-center", vg.subtitle)}>Refreshing events…</p>
        ) : events.length === 0 ? (
          <EmptyState
            title="No weddings in this view"
            description={
              statusFilter === "all"
                ? "Create your first client event to start managing budgets and bookings."
                : `No events with status “${statusFilter}”. Try another filter or create a new event.`
            }
            action={
              <GlassButton type="button" variant="primary" className="gap-1.5" onClick={openCreateEventModal}>
                <CalendarPlus size={16} aria-hidden />
                Create event
              </GlassButton>
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
                <li key={event.plannerClientEventId}>
                  <article
                    className={cn(
                      "rounded-xl border border-white/55 bg-white/40 p-5 backdrop-blur-sm sm:p-6",
                      "transition-all duration-200 hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/55 hover:shadow-[0_4px_20px_hsl(345_100%_25%/0.08)]"
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex min-w-0 gap-4">
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-glass-body text-lg font-bold text-primary"
                          aria-hidden
                        >
                          {event.eventName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className={cn("truncate font-medium", vg.body)}>{event.eventName}</h3>
                          <p className={cn("mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5", vg.subtitle)}>
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
                          <p className={cn("mt-1 font-medium", vg.caption)}>
                            {days > 0
                              ? `${days} days until wedding`
                              : days === 0
                                ? "Wedding day"
                                : `${Math.abs(days)} days ago`}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={event.status} />
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                            LIFECYCLE_PILL[stage]
                          )}
                        >
                          {stage}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className={vg.caption}>Budget spent</span>
                        <span className="font-semibold tabular-nums text-foreground">
                          {formatLKR(event.spentBudget)}
                          <span className={cn("font-normal", vg.caption)}>
                            {" "}
                            / {formatLKR(event.totalBudget)} ({formatPercentDisplay(utilization)})
                          </span>
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/50 ring-1 ring-white/60">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            utilization >= 90
                              ? "bg-destructive"
                              : utilization >= 70
                                ? "bg-warning"
                                : "bg-primary"
                          )}
                          style={{ width: `${budgetUsageBarWidth(event.spentBudget, event.totalBudget)}%` }}
                          role="progressbar"
                          aria-valuenow={utilization}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${formatPercentDisplay(utilization)} of budget spent`}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", vg.caption, "bg-white/50 ring-1 ring-white/60")}>
                        Pending {event.requestedBookings}
                      </span>
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-primary/15">
                        Confirmed {event.confirmedBookings}
                      </span>
                      <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent ring-1 ring-accent/15">
                        Completed {event.completedBookings}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 border-t border-white/40 pt-4">
                      <GlassButton href={`/events/${event.eventId}`} variant="primary" className="gap-1">
                        Open event
                        <ArrowRight size={14} aria-hidden />
                      </GlassButton>
                      <GlassButton href={`/events/${event.eventId}/budget`} variant="ghost">
                        Budget
                      </GlassButton>
                      <GlassButton href={`/events/${event.eventId}/team`} variant="ghost">
                        Team
                      </GlassButton>
                      <GlassButton href="/planner/tasks" variant="ghost">
                        Timeline
                      </GlassButton>
                    </div>
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
