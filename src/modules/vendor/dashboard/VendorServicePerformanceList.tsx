"use client";

import type { ServicePerformanceRow } from "@/modules/vendor/dashboard/vendorAnalyticsHelpers";
import { formatLKR } from "@/shared/components/ui";
import { VendorChartEmptyState } from "@/modules/vendor/dashboard/VendorChartEmptyState";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

function rowTotalValue(row: ServicePerformanceRow): number {
  return row.earnedRevenue + row.pipelineRevenue;
}

function formatRowValue(row: ServicePerformanceRow): { primary: string; secondary?: string } {
  const total = rowTotalValue(row);
  if (total <= 0) {
    return { primary: `${row.bookingCount} booking${row.bookingCount === 1 ? "" : "s"}` };
  }
  if (row.earnedRevenue > 0 && row.pipelineRevenue > 0) {
    return {
      primary: formatLKR(total),
      secondary: `${formatLKR(row.earnedRevenue)} earned · ${formatLKR(row.pipelineRevenue)} pipeline`,
    };
  }
  if (row.pipelineRevenue > 0) {
    return {
      primary: formatLKR(row.pipelineRevenue),
      secondary: "In pipeline",
    };
  }
  return {
    primary: formatLKR(row.earnedRevenue),
    secondary: "Earned",
  };
}

export function VendorServicePerformanceList({
  rows,
}: {
  rows: ServicePerformanceRow[];
}) {
  if (rows.length === 0) {
    return (
      <VendorChartEmptyState
        title="No service bookings yet"
        description="When couples book your services, performance by listing will appear here."
      />
    );
  }

  const ranked = rows.filter((row) => row.bookingCount > 0);
  const peak = Math.max(...ranked.map(rowTotalValue), 1);

  return (
    <ul className="space-y-5 py-1" role="list" aria-label="Top services by booking value">
      {ranked.map((row, index) => {
        const total = rowTotalValue(row);
        const widthPct = total > 0 ? Math.max(10, Math.round((total / peak) * 100)) : 8;
        const value = formatRowValue(row);

        return (
          <li key={row.serviceName} className="space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2.5">
                <span
                  className={cn(
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold",
                    index === 0 ? "bg-primary/15 text-primary" : "bg-white/60 text-muted-foreground"
                  )}
                  aria-hidden
                >
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className={cn("truncate font-medium", vg.body)} title={row.serviceName}>
                    {row.serviceName}
                  </p>
                  <p className={cn("mt-0.5", vg.caption)}>
                    {row.bookingCount} booking{row.bookingCount === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className={cn("font-semibold tabular-nums", vg.body)}>{value.primary}</p>
                {value.secondary ? (
                  <p className={cn("mt-0.5", vg.caption)}>{value.secondary}</p>
                ) : null}
              </div>
            </div>
            {total > 0 ? (
              <div className="h-2.5 overflow-hidden rounded-full bg-white/50 ring-1 ring-white/60">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/75 transition-all duration-500"
                  style={{ width: `${widthPct}%` }}
                  role="presentation"
                />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
