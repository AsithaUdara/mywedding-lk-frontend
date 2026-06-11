"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock4,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { useNotifications } from "@/shared/context/NotificationContext";
import {
  getPlannerEvents,
  getPlannerOverview,
  PlannerEventListItem,
  PlannerOverviewResponse,
  type EventLifecycleStage,
} from "@/shared/lib/api/planner";
import { ErrorBanner, formatLKR, StatusBadge } from "@/modules/planner/components/ui";
import { budgetUsagePercent, formatPercentDisplay } from "@/shared/lib/format";
import {
  usePlannerCreateEventModal,
  usePlannerEventCreated,
} from "@/modules/planner/subscription/PlannerCreateEventProvider";
import { formatPlannerPlanTier } from "@/modules/planner/subscription/planTier";
import {
  EmptyState,
  PageLoadingSkeleton,
  ProgressBar,
} from "@/shared/components/ui";
import {
  GlassButton,
  GlassPageHeader,
  GlassQuickActionLink,
  GlassSectionCard,
  GlassStatCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";

const LIFECYCLE_ORDER: EventLifecycleStage[] = [
  "Lead",
  "Onboarding",
  "Planning",
  "Execution",
  "Archived",
];

const LIFECYCLE_BAR: Record<EventLifecycleStage, string> = {
  Lead: "bg-muted-foreground/40",
  Onboarding: "bg-warning",
  Planning: "bg-accent",
  Execution: "bg-primary",
  Archived: "bg-muted",
};

export default function PlannerDashboardPage() {
  const { user } = useAuth();
  const { notify } = useNotifications();
  const { openCreateEventModal } = usePlannerCreateEventModal();
  const [overview, setOverview] = useState<PlannerOverviewResponse | null>(null);
  const [events, setEvents] = useState<PlannerEventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const [overviewData, eventsData] = await Promise.all([
        getPlannerOverview(token),
        getPlannerEvents(token),
      ]);
      setOverview(overviewData);
      setEvents(eventsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load planner overview.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  usePlannerEventCreated((detail) => {
    void load();
    if (detail?.eventId) {
      const taskCount = detail.tasksGenerated > 0 ? detail.tasksGenerated : 8;
      notify(
        "Wedding created",
        `${detail.eventName ?? "Your event"} — ${taskCount} starter tasks are on the timeline.`,
        {
          variant: "success",
          action: {
            label: "Open timeline",
            href: `/planner/tasks?eventId=${encodeURIComponent(detail.eventId)}&welcome=1`,
          },
        }
      );
    }
  });

  const bookingTotals = useMemo(() => {
    const pending = overview?.pendingBookings ?? 0;
    const confirmed = overview?.confirmedBookings ?? 0;
    const completed = events.reduce((s, e) => s + e.completedBookings, 0);
    const total = pending + confirmed + completed || 1;
    return { pending, confirmed, completed, total };
  }, [overview, events]);

  const budgetSummary = useMemo(
    () =>
      events.reduce(
        (acc, e) => {
          acc.total += e.totalBudget;
          acc.spent += e.spentBudget;
          return acc;
        },
        { total: 0, spent: 0 }
      ),
    [events]
  );

  const utilizationPct =
    budgetUsagePercent(budgetSummary.spent, budgetSummary.total);

  const lifecycleCounts = useMemo(() => {
    const counts: Record<EventLifecycleStage, number> = {
      Lead: 0,
      Onboarding: 0,
      Planning: 0,
      Execution: 0,
      Archived: 0,
    };
    for (const e of events) {
      const stage = e.eventLifecycleStage ?? "Planning";
      if (stage in counts) counts[stage as EventLifecycleStage] += 1;
    }
    return counts;
  }, [events]);

  const lifecycleTotal = events.length || 1;

  const clientsNeedingAttention = useMemo(
    () =>
      events.filter(
        (e) =>
          e.eventLifecycleStage === "Lead" ||
          e.eventLifecycleStage === "Onboarding" ||
          e.requestedBookings > e.confirmedBookings
      ).length,
    [events]
  );

  const upcomingSorted = useMemo(() => {
    if (!overview?.upcomingEvents?.length) return [];
    return [...overview.upcomingEvents]
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
      .map((row) => {
        const full = events.find((e) => e.eventId === row.eventId);
        return {
          ...row,
          totalBudget: full?.totalBudget ?? 0,
          taskPlanPhase: full?.taskPlanPhase ?? "None",
          eventLifecycleStage: full?.eventLifecycleStage ?? "Lead",
        };
      });
  }, [overview, events]);

  if (loading && !overview) {
    return <PageLoadingSkeleton />;
  }

  const planLabel = formatPlannerPlanTier(overview?.activePlanTier ?? "Free");

  return (
    <div className="space-y-6 pb-4 md:space-y-8">
      <GlassPageHeader
        title={overview?.businessName || "Command center"}
        description={
          overview
            ? `${overview.plannerName ? `${overview.plannerName} · ` : ""}${planLabel} plan · up to ${overview.maxConcurrentEvents} concurrent weddings`
            : "Your agency overview — clients, bookings, and revenue at a glance"
        }
        badge={planLabel}
        action={
          <div className="flex flex-wrap gap-2">
            <GlassButton href="/planner/clients" variant="ghost" className="gap-1.5">
              <Users size={16} aria-hidden />
              Clients
            </GlassButton>
            <GlassButton variant="primary" className="gap-1.5" onClick={openCreateEventModal}>
              <Plus size={16} aria-hidden />
              New event
            </GlassButton>
          </div>
        }
      />

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GlassStatCard
          label="Active weddings"
          value={overview?.activeWeddings ?? 0}
          sub={`of ${overview?.maxConcurrentEvents ?? 0} limit`}
          icon={Users}
          iconTheme="primary"
        />
        <GlassStatCard
          label="Pending bookings"
          value={overview?.pendingBookings ?? 0}
          sub={bookingTotals.pending > 0 ? "Action needed · awaiting vendor" : "Awaiting vendor"}
          icon={Clock4}
          iconTheme="warning"
        />
        <GlassStatCard
          label="Confirmed"
          value={overview?.confirmedBookings ?? 0}
          sub="Ready to execute"
          icon={CheckCircle2}
          iconTheme="success"
        />
        <GlassStatCard
          label="Portfolio budget"
          value={formatLKR(budgetSummary.total)}
          sub={`${formatPercentDisplay(utilizationPct)} utilized`}
          icon={Wallet}
          iconTheme="accent"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassSectionCard
          title="Booking pipeline"
          subtitle="Procurement across all weddings"
          action={
            <GlassButton href="/planner/bookings" variant="ghost" className="gap-1">
              View all
              <ArrowRight size={14} aria-hidden />
            </GlassButton>
          }
        >
          <div className="space-y-5">
            <ProgressBar
              label="Pending"
              count={bookingTotals.pending}
              total={bookingTotals.total}
              barClassName="bg-warning"
            />
            <ProgressBar
              label="Confirmed"
              count={bookingTotals.confirmed}
              total={bookingTotals.total}
              barClassName="bg-primary"
            />
            <ProgressBar
              label="Completed"
              count={bookingTotals.completed}
              total={bookingTotals.total}
              barClassName="bg-success"
            />
          </div>
        </GlassSectionCard>

        <GlassSectionCard
          title="Client health"
          subtitle={`${clientsNeedingAttention} need attention`}
        >
          <div className="space-y-4">
            {LIFECYCLE_ORDER.map((stage) => (
              <ProgressBar
                key={stage}
                label={stage}
                count={lifecycleCounts[stage]}
                total={lifecycleTotal}
                barClassName={LIFECYCLE_BAR[stage]}
              />
            ))}
          </div>
          <GlassButton href="/planner/clients" variant="ghost" className="mt-6 gap-1">
            Open CRM
            <ArrowRight size={14} aria-hidden />
          </GlassButton>
        </GlassSectionCard>

        <GlassSectionCard title="Quick actions" subtitle="Common workflows">
          <div className="space-y-2">
            <GlassQuickActionLink
              href="/planner/events"
              label="Manage weddings"
              description="Create & assign client events"
              icon={<CalendarDays size={18} />}
            />
            <GlassQuickActionLink
              href="/planner/tasks"
              label="Timeline & tasks"
              description="Gantt and Kanban views"
              icon={<CalendarClock size={18} />}
            />
            <GlassQuickActionLink
              href="/planner/ai"
              label="AI copilot"
              description="Draft emails & summaries"
              icon={<Sparkles size={18} />}
            />
            <GlassQuickActionLink
              href="/planner/billing"
              label="Upgrade plan"
              description="More concurrent events"
              icon={<TrendingUp size={18} />}
            />
          </div>
        </GlassSectionCard>
      </div>

      <div className="grid gap-6">
        <GlassSectionCard
          title="Upcoming weddings"
          subtitle="Next celebrations on your calendar"
          action={
            <GlassButton href="/planner/events" variant="ghost" className="gap-1">
              All events
              <ArrowRight size={14} aria-hidden />
            </GlassButton>
          }
        >
          {upcomingSorted.length === 0 ? (
            <EmptyState
              title="No upcoming weddings"
              description="When you onboard clients, their next dates appear here."
              action={
                <GlassButton type="button" variant="primary" onClick={openCreateEventModal}>
                  Create event
                </GlassButton>
              }
              className="border-0 bg-transparent shadow-none"
            />
          ) : (
            <ul className="space-y-3" role="list">
              {upcomingSorted.map((event) => (
                <li key={event.eventId}>
                  <article
                    className={cn(
                      "rounded-xl border border-white/55 bg-white/40 p-4 backdrop-blur-sm sm:p-5",
                      "transition-all duration-200 hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/55"
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                          {event.eventName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className={cn("font-medium", vg.body)}>{event.eventName}</p>
                          <p className={cn("mt-1 flex flex-wrap items-center gap-x-2", vg.subtitle)}>
                            <CalendarClock size={14} className="shrink-0" aria-hidden />
                            {new Date(event.eventDate).toLocaleDateString(undefined, {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                            {event.clientEmail && (
                              <span className="truncate">· {event.clientEmail}</span>
                            )}
                          </p>
                          <p className={cn("mt-1", vg.caption)}>
                            Budget {formatLKR(event.totalBudget)}
                            {event.taskPlanPhase === "Discovery" && (
                              <span className="ml-2 font-medium text-amber-800">
                                · Setup in progress
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={event.status} />
                        <GlassButton
                          href={`/planner/tasks?eventId=${encodeURIComponent(event.eventId)}&welcome=1`}
                          variant="primary"
                          className="gap-1"
                        >
                          Timeline
                          <ArrowRight size={14} aria-hidden />
                        </GlassButton>
                        <GlassButton href={`/events/${event.eventId}`} variant="ghost" className="gap-1">
                          Hub
                          <ArrowRight size={14} aria-hidden />
                        </GlassButton>
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </GlassSectionCard>
      </div>

      <section
        className={cn(
          rf.panel,
          "border-primary/25 bg-gradient-to-br from-primary/10 via-white/50 to-white/40 px-5 py-5 sm:px-6 sm:py-6"
        )}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <p className={vg.label}>Planner Pro</p>
            <h3 className="mt-2 text-xl font-semibold text-foreground">
              Scale your studio
            </h3>
            <p className={cn("mt-2 leading-relaxed", vg.subtitle)}>
              Run more concurrent weddings, unlock AI workflows, and keep every client on track with
              one workspace.
            </p>
          </div>
          <GlassButton href="/planner/billing" variant="primary" className="shrink-0 gap-1.5">
            View plans
            <ArrowRight size={16} aria-hidden />
          </GlassButton>
        </div>
      </section>
    </div>
  );
}
