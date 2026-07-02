"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "@/shared/context/NotificationContext";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Plus,
} from "lucide-react";
import { usePlannerEventInsights } from "@/shared/hooks/query/usePlannerEventInsights";
import {
  usePlannerEventsQuery,
  usePlannerOverviewQuery,
} from "@/shared/hooks/query/usePlannerQueries";
import { queryKeys } from "@/shared/lib/query/queryKeys";
import { ErrorBanner } from "@/modules/planner/components/ui";
import {
  buildAttentionItems,
  countNeedsAttention,
  daysUntilWedding,
  findNextWedding,
  formatWeddingDate,
  lifecycleLabel,
  taskPlanLabel,
  type AttentionItem,
} from "@/modules/planner/dashboard/plannerDashboardHelpers";
import {
  usePlannerCreateEventModal,
  usePlannerEventCreated,
} from "@/modules/planner/subscription/PlannerCreateEventProvider";
import { formatPlannerPlanTier, isPlannerProTier } from "@/modules/planner/subscription/planTier";
import { EmptyState, PageLoadingSkeleton } from "@/shared/components/ui";
import {
  GlassButton,
  GlassPageHeader,
  GlassSectionCard,
  GlassStatCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";

function AttentionRow({ item }: { item: AttentionItem }) {
  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          "flex items-start justify-between gap-3 rounded-xl border px-4 py-3 transition-colors",
          "border-white/55 bg-white/40 hover:border-primary/25 hover:bg-white/55"
        )}
      >
        <div className="min-w-0">
          <p className={cn("font-medium", vg.body)}>{item.title}</p>
          <p className={cn("mt-0.5", vg.caption)}>{item.description}</p>
        </div>
        <ArrowRight size={16} className="mt-1 shrink-0 text-muted-foreground" aria-hidden />
      </Link>
    </li>
  );
}

export default function PlannerDashboardPage() {
  const queryClient = useQueryClient();
  const { notify } = useNotifications();
  const { openCreateEventModal } = usePlannerCreateEventModal();

  const {
    data: overview = null,
    isLoading: overviewLoading,
    error: overviewError,
  } = usePlannerOverviewQuery();
  const {
    data: events = [],
    isLoading: eventsLoading,
    error: eventsError,
  } = usePlannerEventsQuery();

  const eventIds = useMemo(() => events.map((e) => e.eventId), [events]);
  const { overdueByEvent, draftShortlistByEvent, insightsLoading } =
    usePlannerEventInsights(eventIds);

  const loading = overviewLoading || eventsLoading || insightsLoading;
  const error =
    overviewError?.message ?? eventsError?.message ?? null;

  usePlannerEventCreated((detail) => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.planner.all });
    if (detail?.eventId) {
      const count = detail.tasksGenerated;
      const taskNote =
        count > 0
          ? `${count} task${count === 1 ? "" : "s"} on the timeline.`
          : "Timeline is ready — add tasks or apply a template.";
      notify("Wedding created", `${detail.eventName ?? "Your event"} — ${taskNote}`, {
        variant: "success",
        action: {
          label: "Open timeline",
          href: `/planner/tasks?eventId=${encodeURIComponent(detail.eventId)}&welcome=1`,
        },
      });
    }
  });

  const attentionItems = useMemo(
    () => buildAttentionItems(events, overview, overdueByEvent, draftShortlistByEvent),
    [events, overview, overdueByEvent, draftShortlistByEvent]
  );

  const nextWedding = useMemo(() => findNextWedding(events), [events]);

  const upcomingSorted = useMemo(() => {
    return [...events]
      .filter((e) => new Date(e.eventDate).getTime() >= Date.now() - 24 * 60 * 60 * 1000)
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  }, [events]);

  const lifecycleSummary = useMemo(() => {
    const counts = { Onboarding: 0, Planning: 0, Execution: 0, Lead: 0 };
    for (const e of events) {
      const stage = e.eventLifecycleStage ?? "Planning";
      if (stage in counts) counts[stage as keyof typeof counts] += 1;
    }
    const parts: string[] = [];
    if (counts.Onboarding > 0) parts.push(`${counts.Onboarding} onboarding`);
    if (counts.Planning > 0) parts.push(`${counts.Planning} planning`);
    if (counts.Execution > 0) parts.push(`${counts.Execution} execution`);
    if (counts.Lead > 0) parts.push(`${counts.Lead} lead`);
    return parts.length > 0 ? parts.join(" · ") : "No active weddings";
  }, [events]);

  const needsAttentionCount = countNeedsAttention(attentionItems, overview);
  const isPro = isPlannerProTier(overview?.activePlanTier);

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
            ? `${overview.plannerName ? `${overview.plannerName} · ` : ""}${planLabel} · ${overview.activeWeddings} of ${overview.maxConcurrentEvents} active weddings`
            : "What needs your attention today"
        }
        badge={planLabel}
        action={
          <GlassButton variant="primary" className="gap-1.5" onClick={openCreateEventModal}>
            <Plus size={16} aria-hidden />
            New event
          </GlassButton>
        }
      />

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <GlassStatCard
          label="Active weddings"
          value={overview?.activeWeddings ?? 0}
          sub={`of ${overview?.maxConcurrentEvents ?? 0} capacity`}
          icon={CalendarDays}
          iconTheme="primary"
        />
        <GlassStatCard
          label="Needs attention"
          value={needsAttentionCount}
          sub={needsAttentionCount > 0 ? "Open items below" : "You're caught up"}
          icon={AlertTriangle}
          iconTheme={needsAttentionCount > 0 ? "warning" : "success"}
        />
        <GlassStatCard
          label="Next wedding"
          value={nextWedding ? daysUntilWedding(nextWedding.eventDate) : "—"}
          sub={
            nextWedding
              ? `${nextWedding.eventName} · ${formatWeddingDate(nextWedding.eventDate)}`
              : "No upcoming dates"
          }
          icon={CalendarClock}
          iconTheme="accent"
        />
      </div>

      <GlassSectionCard
        title="Needs attention"
        subtitle={
          attentionItems.length > 0
            ? "Action items across your portfolio"
            : "No urgent items — check your weddings below"
        }
      >
        {attentionItems.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200/60 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-950">
            <CheckCircle2 size={18} className="shrink-0" aria-hidden />
            <span>All caught up. Open a wedding timeline to keep planning on track.</span>
          </div>
        ) : (
          <ul className="space-y-2" role="list">
            {attentionItems.map((item) => (
              <AttentionRow key={item.id} item={item} />
            ))}
          </ul>
        )}
        {events.length > 0 && (
          <p className={cn("mt-4", vg.caption)}>Portfolio: {lifecycleSummary}</p>
        )}
      </GlassSectionCard>

      <GlassSectionCard
        title="Your weddings"
        subtitle="Open timeline to manage tasks, or procurement for vendor shortlists"
        action={
          <GlassButton href="/planner/events" variant="ghost" className="gap-1">
            All events
            <ArrowRight size={14} aria-hidden />
          </GlassButton>
        }
      >
        {upcomingSorted.length === 0 ? (
          <EmptyState
            title="No weddings yet"
            description="Create your first client event to start planning on the timeline."
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
                          {formatWeddingDate(event.eventDate)}
                          <span>· {daysUntilWedding(event.eventDate)} days away</span>
                        </p>
                        <p className={cn("mt-1.5 flex flex-wrap gap-2", vg.caption)}>
                          <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                            {lifecycleLabel(event.eventLifecycleStage)}
                          </span>
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                            {taskPlanLabel(event.taskPlanPhase)}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <GlassButton
                        href={`/planner/tasks?eventId=${encodeURIComponent(event.eventId)}`}
                        variant="primary"
                        className="gap-1"
                      >
                        Timeline
                        <ArrowRight size={14} aria-hidden />
                      </GlassButton>
                      <GlassButton
                        href={`/planner/procurement?eventId=${encodeURIComponent(event.eventId)}`}
                        variant="ghost"
                        className="gap-1"
                      >
                        <ClipboardList size={14} aria-hidden />
                        Procurement
                      </GlassButton>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </GlassSectionCard>

      {!isPro && (
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
                Run more weddings in one workspace
              </h3>
              <p className={cn("mt-2 leading-relaxed", vg.subtitle)}>
                Increase concurrent event capacity, unlock AI assists, and white-label your studio.
              </p>
            </div>
            <GlassButton href="/planner/billing" variant="primary" className="shrink-0 gap-1.5">
              View plans
              <ArrowRight size={16} aria-hidden />
            </GlassButton>
          </div>
        </section>
      )}
    </div>
  );
}
