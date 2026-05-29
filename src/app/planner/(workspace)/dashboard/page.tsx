"use client";

import Link from "next/link";
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
import {
  getPlannerEvents,
  getPlannerOverview,
  PlannerEventListItem,
  PlannerOverviewResponse,
  type EventLifecycleStage,
} from "@/shared/lib/api/planner";
import {
  BudgetBarChart,
  ErrorBanner,
  formatLKR,
  StatusBadge,
} from "@/modules/planner/components/ui";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  PageLoadingSkeleton,
  ProgressBar,
  QuickActionLink,
  SectionCard,
  StatCard,
} from "@/shared/components/ui";

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

  const chartData = useMemo(
    () =>
      events.slice(0, 6).map((e) => ({
        label: e.eventName.split(" ")[0] || "Event",
        spent: e.spentBudget,
        total: e.totalBudget,
      })),
    [events]
  );

  const utilizationPct =
    budgetSummary.total > 0 ? Math.round((budgetSummary.spent / budgetSummary.total) * 100) : 0;

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
    return [...overview.upcomingEvents].sort(
      (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    );
  }, [overview]);

  if (loading && !overview) {
    return <PageLoadingSkeleton />;
  }

  const planLabel = overview?.activePlanTier ?? "Free";

  return (
    <div className="space-y-8 pb-4 lg:space-y-10">
      <PageHeader
        title={overview?.businessName || "Command center"}
        description={
          overview
            ? `${overview.plannerName ? `${overview.plannerName} · ` : ""}${planLabel} plan · up to ${overview.maxConcurrentEvents} concurrent weddings`
            : "Your agency overview — clients, bookings, and revenue at a glance"
        }
        badge={<Badge variant="accent">{planLabel}</Badge>}
        action={
          <div className="flex flex-wrap gap-2">
            <Button href="/planner/clients" variant="secondary" size="sm">
              <Users size={16} aria-hidden />
              Clients
            </Button>
            <Button href="/planner/events" size="sm">
              <Plus size={16} aria-hidden />
              New event
            </Button>
          </div>
        }
      />

      {error && <ErrorBanner message={error} />}

      {/* KPI bento */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active weddings"
          value={overview?.activeWeddings ?? 0}
          sub={`of ${overview?.maxConcurrentEvents ?? 0} limit`}
          icon={Users}
          iconTheme="primary"
          index={0}
        />
        <StatCard
          label="Pending bookings"
          value={overview?.pendingBookings ?? 0}
          sub="Awaiting vendor"
          icon={Clock4}
          iconTheme="warning"
          trend={bookingTotals.pending > 0 ? "Action needed" : undefined}
          trendTone="attention"
          index={1}
        />
        <StatCard
          label="Confirmed"
          value={overview?.confirmedBookings ?? 0}
          sub="Ready to execute"
          icon={CheckCircle2}
          iconTheme="success"
          index={2}
        />
        <StatCard
          label="Portfolio budget"
          value={formatLKR(budgetSummary.total)}
          sub={`${utilizationPct}% utilized`}
          icon={Wallet}
          iconTheme="accent"
          index={3}
        />
      </div>

      {/* Pipeline + budget + quick actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard
          title="Booking pipeline"
          subtitle="Procurement across all weddings"
          action={
            <Link
              href="/planner/bookings"
              className="text-sm font-semibold text-primary hover:underline"
            >
              View all
            </Link>
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
        </SectionCard>

        <SectionCard
          title="Budget by event"
          subtitle="Top allocations in your portfolio"
          action={
            <Link href="/planner/budget" className="text-sm font-semibold text-primary hover:underline">
              Revenue
            </Link>
          }
        >
          {chartData.length === 0 ? (
            <EmptyState
              title="No budget data yet"
              description="Create a client event to start tracking spend vs plan."
              action={
                <Button href="/planner/events" size="sm">
                  Add event
                </Button>
              }
            />
          ) : (
            <>
              <BudgetBarChart data={chartData} />
              <div className="mt-6 flex justify-between border-t border-border pt-4 text-sm">
                <span className="text-muted-foreground">Total spent</span>
                <span className="font-bold tabular-nums text-foreground">
                  {formatLKR(budgetSummary.spent)}
                </span>
              </div>
            </>
          )}
        </SectionCard>

        <SectionCard title="Quick actions" subtitle="Common workflows">
          <div className="space-y-2">
            <QuickActionLink
              href="/planner/events"
              label="Manage weddings"
              description="Create & assign client events"
              icon={<CalendarDays size={18} />}
            />
            <QuickActionLink
              href="/planner/tasks"
              label="Timeline & tasks"
              description="Gantt and Kanban views"
              icon={<CalendarClock size={18} />}
            />
            <QuickActionLink
              href="/planner/ai"
              label="AI copilot"
              description="Draft emails & summaries"
              icon={<Sparkles size={18} />}
            />
            <QuickActionLink
              href="/planner/billing"
              label="Upgrade plan"
              description="More concurrent events"
              icon={<TrendingUp size={18} />}
            />
          </div>
        </SectionCard>
      </div>

      {/* Client health + upcoming */}
      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-1"
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
          <Link
            href="/planner/clients"
            className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            Open CRM
            <ArrowRight size={14} aria-hidden />
          </Link>
        </SectionCard>

        <SectionCard
          className="lg:col-span-2"
          title="Upcoming weddings"
          subtitle="Next celebrations on your calendar"
          action={
            <Link href="/planner/events" className="text-sm font-semibold text-primary hover:underline">
              All events
            </Link>
          }
        >
          {upcomingSorted.length === 0 ? (
            <EmptyState
              title="No upcoming weddings"
              description="When you onboard clients, their next dates appear here."
              action={
                <Button href="/planner/events" size="sm">
                  Create event
                </Button>
              }
            />
          ) : (
            <ul className="space-y-3">
              {upcomingSorted.map((event) => (
                <li key={event.eventId}>
                  <Card padding={false} className="overflow-hidden p-0">
                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">
                          {event.eventName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">{event.eventName}</p>
                          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
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
                          <p className="mt-1 text-xs text-muted-foreground">
                            Budget {formatLKR(event.totalBudget)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={event.status} />
                        <Button href={`/events/${event.eventId}`} size="sm" variant="secondary">
                          Open
                          <ArrowRight size={14} aria-hidden />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* Upgrade CTA */}
      <Card className="border-primary/20 bg-primary text-primary-foreground">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground/70">
              Planner Pro
            </p>
            <h3 className="mt-2 font-playfair text-2xl font-bold">Scale your studio</h3>
            <p className="mt-2 text-sm leading-relaxed text-primary-foreground/85">
              Run more concurrent weddings, unlock AI workflows, and keep every client on track with
              one workspace.
            </p>
          </div>
          <Button
            href="/planner/billing"
            variant="secondary"
            className="shrink-0 border-0 bg-card text-primary hover:opacity-95"
          >
            View plans
            <ArrowRight size={16} aria-hidden />
          </Button>
        </div>
      </Card>
    </div>
  );
}
