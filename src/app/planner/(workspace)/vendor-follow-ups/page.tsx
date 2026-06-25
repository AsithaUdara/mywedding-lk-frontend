"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Store,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { getPlannerEvents } from "@/shared/lib/api/planner";
import { InboxToolbar } from "@/modules/planner/inbox/InboxToolbar";
import { PlannerInboxEventCard } from "@/modules/planner/inbox/PlannerInboxEventCard";
import {
  computeInboxStats,
  filterInboxSummaries,
  inboxFilterCounts,
  mapEventToInboxSummary,
  type InboxFilter,
} from "@/modules/planner/inbox/plannerInboxHelpers";
import { usePlannerCreateEventModal } from "@/modules/planner/subscription/PlannerCreateEventProvider";
import { ErrorBanner } from "@/modules/planner/components/ui";
import { EmptyState, PageLoadingSkeleton } from "@/shared/components/ui";
import {
  GlassButton,
  GlassPageHeader,
  GlassSectionCard,
  GlassStatCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

const FILTER_LABELS: Record<InboxFilter, string> = {
  all: "All weddings",
  active: "Active",
  awaiting: "Awaiting vendor",
};

export default function PlannerVendorFollowUpsPage() {
  const { user } = useAuth();
  const { openCreateEventModal } = usePlannerCreateEventModal();
  const [inboxFilter, setInboxFilter] = useState<InboxFilter>("all");
  const [summaries, setSummaries] = useState<ReturnType<typeof mapEventToInboxSummary>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const events = await getPlannerEvents(token);
      setSummaries(events.map(mapEventToInboxSummary));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load vendor follow-ups.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => computeInboxStats(summaries.map((s) => s.event)), [summaries]);

  const filterCounts = useMemo(() => inboxFilterCounts(summaries), [summaries]);

  const filteredSummaries = useMemo(
    () => filterInboxSummaries(summaries, inboxFilter),
    [summaries, inboxFilter]
  );

  const filterLabel = FILTER_LABELS[inboxFilter];

  if (loading && summaries.length === 0) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-6 pb-4 md:space-y-8">
      <GlassPageHeader
        title="Vendor follow-ups"
        description="Track vendor inquiry status per wedding. Shortlist and send proposals in Procurement; confirm bookings when vendors reply."
        badge="Operations"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <GlassButton href="/planner/procurement" variant="ghost" className="gap-1.5">
              <Store size={16} aria-hidden />
              Procurement
            </GlassButton>
            <GlassButton href="/planner/ai" variant="ghost" className="gap-1.5">
              <Sparkles size={16} aria-hidden />
              AI match
            </GlassButton>
            <GlassButton href="/vendors" variant="primary" className="gap-1.5">
              <Store size={16} aria-hidden />
              Directory
            </GlassButton>
          </div>
        }
      />

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <GlassStatCard
          label="Awaiting vendor"
          value={stats.awaitingVendor}
          sub={
            stats.weddingsNeedingReply > 0
              ? `${stats.weddingsNeedingReply} wedding${stats.weddingsNeedingReply === 1 ? "" : "s"}`
              : "No pending replies"
          }
          icon={Clock}
          iconTheme={stats.awaitingVendor > 0 ? "warning" : "success"}
        />
        <GlassStatCard
          label="Confirmed"
          value={stats.confirmed}
          sub="Vendor bookings locked in"
          icon={CheckCircle2}
          iconTheme="primary"
        />
        <GlassStatCard
          label="Needs follow-up"
          value={stats.weddingsNeedingReply}
          sub={
            stats.completed > 0
              ? `${stats.completed} service${stats.completed === 1 ? "" : "s"} completed`
              : "Weddings with open inquiries"
          }
          icon={AlertTriangle}
          iconTheme={stats.weddingsNeedingReply > 0 ? "warning" : "success"}
        />
      </div>

      <GlassSectionCard
        title="By wedding"
        subtitle={
          inboxFilter === "all"
            ? "Vendor inquiry progress for each client event"
            : `Showing ${filteredSummaries.length} of ${summaries.length} · ${filterLabel.toLowerCase()}`
        }
      >
        <InboxToolbar
          filter={inboxFilter}
          onFilterChange={setInboxFilter}
          counts={filterCounts}
          portfolioTotal={summaries.length}
        />

        {loading ? (
          <p className={cn("py-8 text-center", vg.subtitle)}>Refreshing vendor follow-ups…</p>
        ) : summaries.length === 0 ? (
          <EmptyState
            title="No weddings yet"
            description="Create a client event, then shortlist vendors in Procurement to start inquiries."
            action={
              <GlassButton type="button" variant="primary" onClick={openCreateEventModal}>
                Create event
              </GlassButton>
            }
            className={cn(rf.panel, "border-0 shadow-none")}
          />
        ) : filteredSummaries.length === 0 ? (
          <EmptyState
            title="No weddings in this filter"
            description={
              inboxFilter === "awaiting"
                ? `No open vendor inquiries. You have ${summaries.length} wedding${summaries.length === 1 ? "" : "s"} in your portfolio.`
                : `No ${filterLabel.toLowerCase()} weddings — try another filter.`
            }
            action={
              <GlassButton type="button" variant="ghost" onClick={() => setInboxFilter("all")}>
                Show all weddings
              </GlassButton>
            }
            className="border-0 bg-transparent shadow-none"
          />
        ) : (
          <ul className="space-y-2" role="list">
            {filteredSummaries.map((summary) => (
              <li key={summary.event.eventId}>
                <PlannerInboxEventCard summary={summary} />
              </li>
            ))}
          </ul>
        )}
      </GlassSectionCard>
    </div>
  );
}
