"use client";

import type { BookingStatusSlice } from "@/modules/vendor/dashboard/vendorAnalyticsHelpers";
import { VendorChartEmptyState } from "@/modules/vendor/dashboard/VendorChartEmptyState";
import { VendorChartShell } from "@/modules/vendor/dashboard/VendorChartShell";
import { STATUS_CHART_COLORS } from "@/modules/vendor/dashboard/vendorChartTheme";
import { seriesHasPositiveValues } from "@/modules/vendor/dashboard/vendorChartUtils";
import { cn } from "@/shared/lib/cn";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";

export function VendorStatusDistributionChart({ slices }: { slices: BookingStatusSlice[] }) {
  const values = slices.map((slice) => slice.count);
  const sorted = [...slices].sort((a, b) => b.count - a.count);
  const peak = Math.max(...values, 1);
  const total = values.reduce((sum, value) => sum + value, 0);

  if (slices.length === 0 || !seriesHasPositiveValues(values)) {
    return (
      <VendorChartEmptyState
        title="No bookings yet"
        description="Your queue breakdown by status will appear here."
      />
    );
  }

  return (
    <VendorChartShell
      yAxisLabel="Booking status"
      xAxisLabel="Count"
      footnote={`${total} active booking${total === 1 ? "" : "s"} in queue`}
      minHeight={Math.max(280, sorted.length * 56 + 80)}
    >
      <ul className="space-y-4 py-1" role="list" aria-label="Bookings by status">
        {sorted.map((slice) => {
          const widthPct = Math.max(8, Math.round((slice.count / peak) * 100));
          const color = STATUS_CHART_COLORS[slice.status] ?? "hsl(345 100% 25%)";

          return (
            <li key={slice.status} className="grid grid-cols-[minmax(0,7.5rem)_1fr_auto] items-center gap-3 sm:grid-cols-[minmax(0,9rem)_1fr_auto]">
              <span className={cn("truncate text-sm font-medium", vg.body)} title={slice.label}>
                {slice.label}
              </span>
              <div className="h-8 overflow-hidden rounded-lg bg-white/45 ring-1 ring-white/60">
                <div
                  className="flex h-full items-center rounded-lg px-2 transition-all duration-500"
                  style={{
                    width: `${widthPct}%`,
                    minWidth: "2.5rem",
                    backgroundColor: color,
                  }}
                >
                  <span className="text-xs font-bold tabular-nums text-white drop-shadow-sm">
                    {slice.count}
                  </span>
                </div>
              </div>
              <span className={cn("w-10 text-right text-sm tabular-nums", vg.caption)}>
                {Math.round((slice.count / total) * 100)}%
              </span>
            </li>
          );
        })}
      </ul>
    </VendorChartShell>
  );
}
