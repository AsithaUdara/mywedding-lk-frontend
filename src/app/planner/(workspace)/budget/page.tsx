"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ClipboardCheck, PiggyBank, TrendingDown, Wallet } from "lucide-react";
import { usePlannerEventsQuery } from "@/shared/hooks/query/usePlannerQueries";
import { BudgetToolbar } from "@/modules/planner/budget/BudgetToolbar";
import { PlannerBudgetEventCard } from "@/modules/planner/budget/PlannerBudgetEventCard";
import {
  budgetFilterCounts,
  computeBudgetPortfolioStats,
  filterBudgetSummaries,
  mapEventToBudgetSummary,
  type BudgetFilter,
} from "@/modules/planner/budget/plannerBudgetHelpers";
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
import { formatLKR } from "@/shared/lib/format";

const FILTER_LABELS: Record<BudgetFilter, string> = {
  all: "All weddings",
  active: "Has spend",
  "at-risk": "At risk",
};

export default function PlannerBudgetPage() {
  const { openCreateEventModal } = usePlannerCreateEventModal();
  const {
    data: events = [],
    isLoading: loading,
    error: queryError,
  } = usePlannerEventsQuery();
  const [budgetFilter, setBudgetFilter] = useState<BudgetFilter>("all");

  const summaries = useMemo(() => events.map(mapEventToBudgetSummary), [events]);
  const error = queryError?.message ?? null;

  const stats = useMemo(
    () => computeBudgetPortfolioStats(summaries.map((summary) => summary.event)),
    [summaries]
  );

  const filterCounts = useMemo(() => budgetFilterCounts(summaries), [summaries]);

  const filteredSummaries = useMemo(
    () => filterBudgetSummaries(summaries, budgetFilter),
    [summaries, budgetFilter]
  );

  const filterLabel = FILTER_LABELS[budgetFilter];

  const spentSub =
    stats.portfolioUsageLabel +
    " utilized" +
    (stats.atRiskWeddings > 0 ? ` · ${stats.atRiskWeddings} at risk` : "");

  if (loading && summaries.length === 0) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-6 pb-4 md:space-y-8">
      <GlassPageHeader
        title="Revenue & budgets"
        description="Track client spend against wedding budgets. Open a wedding budget to log expenses, or review vendor payments in Bookings."
        badge="Operations"
        action={
          <GlassButton href="/planner/bookings" variant="primary" className="gap-1.5">
            <ClipboardCheck size={16} aria-hidden />
            Bookings
          </GlassButton>
        }
      />

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <GlassStatCard
          label="Allocated"
          value={formatLKR(stats.allocated)}
          sub={
            stats.weddingsWithBudget > 0
              ? `${stats.weddingsWithBudget} wedding${stats.weddingsWithBudget === 1 ? "" : "s"} with caps`
              : "No budget caps set"
          }
          icon={Wallet}
          iconTheme="primary"
        />
        <GlassStatCard
          label="Spent"
          value={formatLKR(stats.spent)}
          sub={spentSub}
          icon={PiggyBank}
          iconTheme={stats.atRiskWeddings > 0 ? "warning" : "primary"}
        />
        <GlassStatCard
          label={stats.atRiskWeddings > 0 ? "At risk" : "Remaining"}
          value={
            stats.atRiskWeddings > 0
              ? stats.atRiskWeddings
              : formatLKR(stats.remaining)
          }
          sub={
            stats.atRiskWeddings > 0
              ? `Wedding${stats.atRiskWeddings === 1 ? "" : "s"} at 85%+ of cap`
              : `${stats.portfolioUsageLabel} of cap used`
          }
          icon={stats.atRiskWeddings > 0 ? AlertTriangle : TrendingDown}
          iconTheme={stats.atRiskWeddings > 0 ? "warning" : "success"}
        />
      </div>

      <GlassSectionCard
        title="By wedding"
        subtitle={
          budgetFilter === "all"
            ? "Budget utilization for each client event"
            : `Showing ${filteredSummaries.length} of ${summaries.length} · ${filterLabel.toLowerCase()}`
        }
      >
        <BudgetToolbar
          filter={budgetFilter}
          onFilterChange={setBudgetFilter}
          counts={filterCounts}
          portfolioTotal={summaries.length}
        />

        {stats.allocated > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-3 rounded-lg border border-[#EBECF0] bg-[#FAFBFC] px-4 py-3">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#97A0AF]">
              Portfolio
            </span>
            <div className="h-2 min-w-[8rem] flex-1 overflow-hidden rounded-full bg-[#EBECF0]">
              <div
                className={cn(
                  "h-full rounded-full",
                  stats.portfolioUsagePercent >= 85 ? "bg-[#FF991F]" : "bg-primary"
                )}
                style={{
                  width: `${Math.max(stats.portfolioUsagePercent, stats.spent > 0 ? 2 : 0)}%`,
                }}
                role="progressbar"
                aria-valuenow={stats.portfolioUsagePercent}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <span className="text-sm font-medium tabular-nums text-[#172B4D]">
              {formatLKR(stats.spent)} / {formatLKR(stats.allocated)}
            </span>
          </div>
        )}

        {loading ? (
          <p className={cn("py-8 text-center", vg.subtitle)}>Refreshing budgets…</p>
        ) : summaries.length === 0 ? (
          <EmptyState
            title="No weddings yet"
            description="Create a client event and set a budget cap to start tracking spend."
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
              budgetFilter === "at-risk"
                ? `No weddings are at 85% or more of their budget. You have ${summaries.length} wedding${summaries.length === 1 ? "" : "s"} in your portfolio.`
                : budgetFilter === "active"
                  ? "No weddings have recorded spend yet."
                  : `No ${filterLabel.toLowerCase()} weddings — try another filter.`
            }
            action={
              <GlassButton type="button" variant="ghost" onClick={() => setBudgetFilter("all")}>
                Show all weddings
              </GlassButton>
            }
            className="border-0 bg-transparent shadow-none"
          />
        ) : (
          <ul className="space-y-2" role="list">
            {filteredSummaries.map((summary) => (
              <li key={summary.event.eventId}>
                <PlannerBudgetEventCard summary={summary} />
              </li>
            ))}
          </ul>
        )}
      </GlassSectionCard>
    </div>
  );
}
