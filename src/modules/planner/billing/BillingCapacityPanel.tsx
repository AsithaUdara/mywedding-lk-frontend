"use client";

import { AlertTriangle } from "lucide-react";
import type { BillingPortfolioStats } from "@/modules/planner/billing/plannerBillingHelpers";
import { plannerSurface } from "@/modules/planner/theme/plannerWorkspaceTheme";
import { cn } from "@/shared/lib/cn";

type BillingCapacityPanelProps = {
  stats: BillingPortfolioStats;
};

export function BillingCapacityPanel({ stats }: BillingCapacityPanelProps) {
  const barWidth = Math.max(stats.usagePercent, stats.activeWeddings > 0 ? 4 : 0);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#EBECF0] bg-[#FAFBFC] px-4 py-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="font-medium text-[#172B4D]">Concurrent weddings</span>
          <span className="tabular-nums text-[#5E6C84]">
            {stats.activeWeddings} / {stats.maxConcurrentEvents}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#EBECF0]">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${barWidth}%` }}
            role="progressbar"
            aria-valuenow={stats.activeWeddings}
            aria-valuemin={0}
            aria-valuemax={stats.maxConcurrentEvents}
          />
        </div>
      </div>

      {stats.atCapacity && (
        <div className={cn("flex items-start gap-2 rounded-lg border px-4 py-3 text-sm", plannerSurface.alertPanel)}>
          <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden />
          <p>
            You have reached your plan limit. Upgrade to Planner Pro to take on more clients at once.
          </p>
        </div>
      )}
    </div>
  );
}
