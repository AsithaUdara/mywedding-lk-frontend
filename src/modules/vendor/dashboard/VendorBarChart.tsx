"use client";

import { useMemo } from "react";
import { formatLKR } from "@/shared/lib/format";
import { computeChartYMax } from "@/modules/vendor/dashboard/vendorChartUtils";
import { cn } from "@/shared/lib/cn";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";

export type VendorBarChartPoint = {
  label: string;
  value: number;
  valueLabel?: string;
};

type VendorBarChartProps = {
  points: VendorBarChartPoint[];
  yAxisLabel: string;
  xAxisLabel: string;
  ariaLabel: string;
  valueMode?: "count" | "currency";
  barFill?: string;
  className?: string;
};

const PLOT_HEIGHT_PX = 260;

function formatTick(value: number, mode: "count" | "currency"): string {
  if (mode === "currency") {
    if (value === 0) return "0";
    return formatLKR(value).replace("LKR ", "");
  }
  return String(value);
}

function barColumnWidthClass(count: number): string {
  if (count === 1) return "w-28 sm:w-40 md:w-48";
  if (count === 2) return "w-24 sm:w-32 md:w-36 flex-1 max-w-[10rem]";
  if (count <= 4) return "flex-1 min-w-[4.5rem] max-w-[8rem]";
  return "flex-1 min-w-[3rem] max-w-[5.5rem]";
}

export function VendorBarChart({
  points,
  yAxisLabel,
  xAxisLabel,
  ariaLabel,
  valueMode = "count",
  barFill = "hsl(345 100% 25%)",
  className,
}: VendorBarChartProps) {
  const peak = useMemo(() => Math.max(0, ...points.map((point) => point.value)), [points]);
  const yMax = useMemo(() => computeChartYMax(peak), [peak]);

  const yTicks = useMemo(
    () => [0, 0.5, 1].map((t) => Math.round(yMax * t)),
    [yMax]
  );

  const bars = useMemo(
    () =>
      points.map((point) => ({
        ...point,
        valueLabel: point.valueLabel ?? formatTick(point.value, valueMode),
        heightPx:
          point.value > 0
            ? Math.max(20, Math.round((point.value / yMax) * PLOT_HEIGHT_PX))
            : 0,
      })),
    [points, yMax, valueMode]
  );

  const columnClass = barColumnWidthClass(points.length);
  const centerFewBars = points.length <= 3;

  return (
    <div
      className={cn("flex min-h-[340px] w-full flex-col", className)}
      role="img"
      aria-label={ariaLabel}
    >
      <p className={cn("mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground")}>
        {yAxisLabel}
      </p>

      <div className="flex min-h-0 flex-1 gap-3 sm:gap-4">
        <div
          className="flex w-12 shrink-0 flex-col justify-between py-0.5 text-right sm:w-14"
          aria-hidden
        >
          {[...yTicks].reverse().map((tick) => (
            <span key={tick} className="text-[11px] font-medium tabular-nums text-muted-foreground">
              {formatTick(tick, valueMode)}
            </span>
          ))}
        </div>

        <div className="relative flex min-h-[280px] flex-1 flex-col">
          <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col justify-between" style={{ height: PLOT_HEIGHT_PX }}>
            {yTicks.map((tick) => (
              <div
                key={tick}
                className={cn(
                  "border-t",
                  tick === 0 ? "border-border/30" : "border-dashed border-border/20"
                )}
              />
            ))}
          </div>

          <div
            className={cn(
              "relative z-10 flex items-end gap-3 sm:gap-4",
              centerFewBars ? "justify-center" : "justify-between px-1"
            )}
            style={{ height: PLOT_HEIGHT_PX }}
          >
            {bars.map((bar) => (
              <div
                key={bar.label}
                className={cn("flex h-full flex-col items-center justify-end", columnClass)}
              >
                {bar.value > 0 ? (
                  <span
                    className="mb-2 text-xs font-bold tabular-nums sm:text-sm"
                    style={{ color: barFill }}
                  >
                    {bar.valueLabel}
                  </span>
                ) : (
                  <span className="mb-2 h-4" aria-hidden />
                )}
                <div
                  className="w-full rounded-t-xl transition-all duration-500"
                  style={{
                    height: bar.heightPx,
                    backgroundColor: barFill,
                  }}
                />
              </div>
            ))}
          </div>

          <div className="mt-3 border-t border-border/30 pt-3">
            <div
              className={cn(
                "flex gap-3 sm:gap-4",
                centerFewBars ? "justify-center" : "justify-between px-1"
              )}
            >
              {bars.map((bar) => (
                <div
                  key={`${bar.label}-axis`}
                  className={cn("truncate text-center", columnClass)}
                >
                  <span className={cn("text-[11px] font-medium sm:text-xs", vg.caption)}>
                    {bar.label}
                  </span>
                </div>
              ))}
            </div>
            <p className={cn("mt-2 text-center text-xs font-semibold text-muted-foreground")}>
              {xAxisLabel}
            </p>
          </div>
        </div>
      </div>

      <p className={cn("mt-3 text-center", vg.caption)}>
        {valueMode === "currency"
          ? "Amounts in LKR · only months with confirmed or completed bookings"
          : "Only statuses with at least one booking are shown"}
      </p>
    </div>
  );
}
