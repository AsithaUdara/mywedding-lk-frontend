"use client";

import { AlertTriangle, ArrowRight, CalendarClock, ClipboardCheck, Wallet } from "lucide-react";
import type { BudgetEventSummary } from "@/modules/planner/budget/plannerBudgetHelpers";
import { formatBudgetAmountPair } from "@/modules/planner/budget/plannerBudgetHelpers";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { plannerLozenge } from "@/modules/planner/theme/plannerWorkspaceTheme";
import { cn } from "@/shared/lib/cn";

type PlannerBudgetEventCardProps = {
  summary: BudgetEventSummary;
};

function RiskBadge({ summary }: { summary: BudgetEventSummary }) {
  switch (summary.riskStatus) {
    case "at-risk":
      return (
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", plannerLozenge.warning)}>
          <AlertTriangle size={10} aria-hidden />
          At risk · {summary.usageLabel}
        </span>
      );
    case "no-budget":
      return (
        <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-semibold", plannerLozenge.neutral)}>
          No budget cap set
        </span>
      );
    case "no-spend":
      return (
        <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-semibold", plannerLozenge.primary)}>
          No spend recorded
        </span>
      );
    default:
      return (
        <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-semibold", plannerLozenge.success)}>
          On track · {summary.usageLabel}
        </span>
      );
  }
}

export function PlannerBudgetEventCard({ summary }: PlannerBudgetEventCardProps) {
  const budgetHref = `/events/${summary.event.eventId}/budget`;
  const bookingsHref = "/planner/bookings";

  return (
    <article className="rounded-lg border border-[#DFE1E6] bg-white shadow-[0_1px_1px_rgba(9,30,66,0.08)]">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-[#5E6C84]">{summary.eventKey}</p>
          <h3 className="mt-0.5 font-medium text-[#172B4D]">{summary.event.eventName}</h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-[#5E6C84]">
            <CalendarClock size={13} className="shrink-0" aria-hidden />
            {summary.weddingDateLabel}
            <span>· {summary.daysUntil}d away</span>
          </p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <RiskBadge summary={summary} />
            {summary.total > 0 && summary.remaining > 0 && summary.spent > 0 && (
              <span className="rounded-full bg-[#DFE1E6] px-2.5 py-0.5 text-[10px] font-semibold text-[#42526E]">
                {summary.remaining >= 1_000_000
                  ? `LKR ${(summary.remaining / 1_000_000).toFixed(1)}M left`
                  : summary.remaining >= 1_000
                    ? `LKR ${Math.round(summary.remaining / 1_000)}K left`
                    : `LKR ${summary.remaining.toLocaleString()} left`}
              </span>
            )}
          </div>

          {summary.total > 0 && (
            <div className="mt-3 max-w-md">
              <div className="mb-1 flex justify-between gap-2 text-[10px] text-[#5E6C84]">
                <span>Budget utilization</span>
                <span className="tabular-nums">{formatBudgetAmountPair(summary.spent, summary.total)}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#EBECF0]">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    summary.atRisk ? "bg-[#FF991F]" : "bg-primary"
                  )}
                  style={{
                    width: `${Math.max(summary.barWidth, summary.spent > 0 ? 4 : 0)}%`,
                  }}
                  role="progressbar"
                  aria-valuenow={summary.usagePercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${summary.event.eventName} budget usage`}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <GlassButton href={budgetHref} variant="primary" className="gap-1 px-2.5 py-1.5 text-xs">
            <Wallet size={13} aria-hidden />
            Budget
          </GlassButton>
          <GlassButton href={bookingsHref} variant="ghost" className="gap-1 px-2.5 py-1.5 text-xs">
            <ClipboardCheck size={13} aria-hidden />
            Bookings
            <ArrowRight size={12} aria-hidden />
          </GlassButton>
        </div>
      </div>
    </article>
  );
}
