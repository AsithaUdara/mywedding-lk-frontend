"use client";

import { useMemo } from "react";
import type { WinRateSummary } from "@/shared/lib/api/vendors";
import { VendorChartEmptyState } from "@/modules/vendor/dashboard/VendorChartEmptyState";
import { VendorChartShell } from "@/modules/vendor/dashboard/VendorChartShell";
import { FUNNEL_COLORS } from "@/modules/vendor/dashboard/vendorChartTheme";
import { vendorCloseRateLabel } from "@/modules/vendor/dashboard/vendorAnalyticsHelpers";
import { cn } from "@/shared/lib/cn";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";

function buildConicGradient(
  segments: Array<{ value: number; fill: string }>,
  total: number
): string {
  if (total <= 0) return "hsl(var(--muted))";

  let cursor = 0;
  const stops = segments
    .filter((segment) => segment.value > 0)
    .map((segment) => {
      const start = cursor;
      cursor += (segment.value / total) * 100;
      return `${segment.fill} ${start}% ${cursor}%`;
    });

  return `conic-gradient(${stops.join(", ")})`;
}

export function VendorBookingFunnelChart({
  winRate,
  winTotal,
}: {
  winRate: WinRateSummary;
  winPct?: number;
  winTotal: number;
}) {
  const segments = useMemo(
    () => [
      { key: "won" as const, value: winRate.won, ...FUNNEL_COLORS.won },
      { key: "pending" as const, value: winRate.pending, ...FUNNEL_COLORS.pending },
      { key: "lost" as const, value: winRate.lost, ...FUNNEL_COLORS.lost },
    ],
    [winRate]
  );

  const activeSegments = segments.filter((segment) => segment.value > 0);
  const closeLabel = vendorCloseRateLabel(winRate);

  if (winTotal === 0) {
    return (
      <VendorChartEmptyState
        title="No booking pipeline yet"
        description="When requests arrive, won vs in-progress vs lost will show here."
      />
    );
  }

  return (
    <VendorChartShell footnote="Share of all bookings by outcome" minHeight={340}>
      <div className="flex flex-col items-center gap-6 py-2 lg:flex-row lg:items-center lg:justify-center lg:gap-10">
        <div className="relative h-44 w-44 shrink-0 sm:h-48 sm:w-48">
          <div
            className="h-full w-full rounded-full shadow-inner ring-1 ring-white/60"
            style={{ background: buildConicGradient(activeSegments, winTotal) }}
            role="img"
            aria-label={`Booking outcomes: ${activeSegments.map((s) => `${s.label} ${s.value}`).join(", ")}`}
          />
          <div className="absolute inset-[18%] flex flex-col items-center justify-center rounded-full bg-white/90 text-center shadow-sm ring-1 ring-white/80 backdrop-blur-sm">
            <p className={vg.label}>{closeLabel.label}</p>
            <p className="text-2xl font-bold tabular-nums text-foreground sm:text-3xl">
              {closeLabel.value}
            </p>
            <p className={cn("mt-0.5 max-w-[7rem] text-[10px] leading-tight", vg.caption)}>
              {closeLabel.hint}
            </p>
          </div>
        </div>

        <ul className="w-full max-w-xs space-y-3" role="list">
          {segments.map((segment) => (
            <li
              key={segment.key}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl border px-4 py-3",
                segment.value > 0
                  ? "border-white/60 bg-white/45"
                  : "border-transparent bg-transparent opacity-40"
              )}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className="h-3 w-3 shrink-0 rounded-full ring-2 ring-white/80"
                  style={{ backgroundColor: segment.fill }}
                  aria-hidden
                />
                <span className={cn("font-medium", vg.body)}>{segment.label}</span>
              </span>
              <span className="text-right">
                <span className={cn("font-semibold tabular-nums", vg.body)}>{segment.value}</span>
                {winTotal > 0 && segment.value > 0 ? (
                  <span className={cn("ml-2", vg.caption)}>
                    {Math.round((segment.value / winTotal) * 100)}%
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </VendorChartShell>
  );
}
