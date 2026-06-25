"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CalendarPlus,
  Filter,
  Users,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  usePlannerCreateEventModal,
  usePlannerEventCreated,
} from "@/modules/planner/subscription/PlannerCreateEventProvider";
import { getPlannerEvents } from "@/shared/lib/api/planner";
import { getTasksForEvent } from "@/shared/lib/api/tasks";
import { getVendorShortlist } from "@/shared/lib/api/vendorShortlist";
import { PlannerEventCard } from "@/modules/planner/events/PlannerEventCard";
import {
  countPortfolioAttention,
  mapEventToPortfolioItem,
  sortPortfolioByWeddingDate,
  type PlannerEventPortfolioItem,
} from "@/modules/planner/events/plannerEventHelpers";
import { formatWeddingDate } from "@/modules/planner/dashboard/plannerDashboardHelpers";
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

type StatusFilter = "all" | "Active" | "OnHold" | "Completed" | "Archived";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "Active", label: "Active" },
  { value: "OnHold", label: "On hold" },
  { value: "Completed", label: "Completed" },
  { value: "Archived", label: "Archived" },
];

export default function PlannerEventsPage() {
  const { user } = useAuth();
  const { openCreateEventModal } = usePlannerCreateEventModal();
  const [portfolio, setPortfolio] = useState<PlannerEventPortfolioItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const events = await getPlannerEvents(token);

      const items = await Promise.all(
        events.map(async (event) => {
          try {
            const [tasks, shortlist] = await Promise.all([
              getTasksForEvent(token, event.eventId),
              getVendorShortlist(token, event.eventId),
            ]);
            return mapEventToPortfolioItem(event, tasks, shortlist);
          } catch {
            return mapEventToPortfolioItem(event, [], []);
          }
        })
      );

      setPortfolio(sortPortfolioByWeddingDate(items));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  usePlannerEventCreated(fetchEvents);

  const filteredPortfolio = useMemo(() => {
    if (statusFilter === "all") return portfolio;
    return portfolio.filter((item) => item.event.status === statusFilter);
  }, [portfolio, statusFilter]);

  const activeCount = useMemo(
    () => portfolio.filter((item) => item.event.status === "Active").length,
    [portfolio]
  );

  const attentionCount = useMemo(() => countPortfolioAttention(portfolio), [portfolio]);

  const nextWedding = useMemo(() => {
    const now = Date.now() - 24 * 60 * 60 * 1000;
    return (
      portfolio.find(
        (item) =>
          item.event.status === "Active" &&
          new Date(item.event.eventDate).getTime() >= now
      ) ?? null
    );
  }, [portfolio]);

  const filterLabel = STATUS_FILTERS.find((f) => f.value === statusFilter)?.label ?? statusFilter;

  if (loading && portfolio.length === 0) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-6 pb-4 md:space-y-8">
      <GlassPageHeader
        title="Events"
        description="Your wedding portfolio — open an event for details, or jump to timeline and procurement."
        badge="Portfolio"
        action={
          <GlassButton type="button" variant="primary" className="gap-1.5" onClick={openCreateEventModal}>
            <CalendarPlus size={16} aria-hidden />
            New event
          </GlassButton>
        }
      />

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <GlassStatCard
          label="Active weddings"
          value={activeCount}
          sub={`${portfolio.length} total in portfolio`}
          icon={Users}
          iconTheme="primary"
        />
        <GlassStatCard
          label="Needs attention"
          value={attentionCount}
          sub={attentionCount > 0 ? "Setup, tasks, or bookings" : "All events on track"}
          icon={AlertTriangle}
          iconTheme={attentionCount > 0 ? "warning" : "success"}
        />
        <GlassStatCard
          label="Next wedding"
          value={nextWedding ? nextWedding.daysUntil : "—"}
          sub={
            nextWedding
              ? `${nextWedding.event.eventName} · ${formatWeddingDate(nextWedding.event.eventDate)}`
              : "No upcoming dates"
          }
          icon={CalendarClock}
          iconTheme="accent"
        />
      </div>

      <GlassSectionCard
        title="Wedding portfolio"
        subtitle={
          statusFilter === "all"
            ? "Sorted by wedding date · all statuses"
            : `Showing ${filteredPortfolio.length} ${filterLabel.toLowerCase()} · ${portfolio.length} total in portfolio`
        }
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
        ) : filteredPortfolio.length === 0 ? (
          <EmptyState
            title="No weddings in this view"
            description={
              statusFilter === "all"
                ? "Create your first client event to start planning on the timeline."
                : `No events with status “${filterLabel}”. You have ${portfolio.length} wedding${portfolio.length === 1 ? "" : "s"} in your portfolio — try All or Active.`
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
          <ul className="space-y-3" role="list">
            {filteredPortfolio.map((item) => (
              <li key={item.event.plannerClientEventId}>
                <PlannerEventCard item={item} />
              </li>
            ))}
          </ul>
        )}
      </GlassSectionCard>
    </div>
  );
}
