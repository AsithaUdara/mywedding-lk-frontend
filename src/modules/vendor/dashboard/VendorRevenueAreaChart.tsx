"use client";

import { useId, useMemo } from "react";
import type { VendorEarningsPoint } from "@/modules/vendor/dashboard/vendorAnalyticsHelpers";
import { formatLKR } from "@/shared/lib/format";
import { computeChartYMax } from "@/modules/vendor/dashboard/vendorChartUtils";
import { VendorChartEmptyState } from "@/modules/vendor/dashboard/VendorChartEmptyState";
import { VendorChartShell } from "@/modules/vendor/dashboard/VendorChartShell";
import {
  CHART_AXIS,
  CHART_GRID,
  CHART_TICK,
  VENDOR_CHART,
} from "@/modules/vendor/dashboard/vendorChartTheme";

function formatRevenueTick(value: number): string {
  if (value === 0) return "0";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return String(value);
}

function xForIndex(index: number, count: number, plotLeft: number, plotWidth: number) {
  if (count <= 1) return plotLeft + plotWidth / 2;
  return plotLeft + (index / (count - 1)) * plotWidth;
}

export function VendorRevenueAreaChart({ data }: { data: VendorEarningsPoint[] }) {
  const fillId = useId().replace(/:/g, "");
  const hasRevenue = data.some((point) => point.amount > 0);

  const yMax = useMemo(() => {
    const peak = Math.max(0, ...data.map((point) => point.amount));
    return computeChartYMax(peak);
  }, [data]);

  const geometry = useMemo(() => {
    const { width, height, marginLeft, marginRight, marginTop, marginBottom } = VENDOR_CHART;
    const plotLeft = marginLeft;
    const plotRight = width - marginRight;
    const plotTop = marginTop;
    const plotBottom = height - marginBottom;
    const plotWidth = plotRight - plotLeft;
    const plotHeight = plotBottom - plotTop;

    const coords = data.map((point, index) => {
      const x = xForIndex(index, data.length, plotLeft, plotWidth);
      const y = plotBottom - (point.amount / yMax) * plotHeight;
      return { ...point, x, y };
    });

    const linePath = coords
      .map((coord, index) => `${index === 0 ? "M" : "L"} ${coord.x.toFixed(2)} ${coord.y.toFixed(2)}`)
      .join(" ");
    const areaPath =
      coords.length > 0
        ? `${linePath} L ${coords[coords.length - 1].x.toFixed(2)} ${plotBottom} L ${coords[0].x.toFixed(2)} ${plotBottom} Z`
        : "";

    const yTicks = [0, 0.5, 1].map((t) => ({
      t,
      value: Math.round(yMax * t),
      y: plotBottom - t * plotHeight,
    }));

    return { width, height, plotLeft, plotRight, plotTop, plotBottom, coords, linePath, areaPath, yTicks };
  }, [data, yMax]);

  if (!hasRevenue) {
    return (
      <VendorChartEmptyState
        title="No earnings yet"
        description="Completed and confirmed bookings will trend here by service month."
      />
    );
  }

  return (
    <VendorChartShell
      yAxisLabel="Revenue (LKR)"
      xAxisLabel="Service month"
      footnote="Confirmed and completed bookings · last 6 months"
      minHeight={340}
    >
      <svg
        viewBox={`0 0 ${geometry.width} ${geometry.height}`}
        className="block h-[300px] w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="Monthly revenue trend for the last six months"
      >
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(42 48% 52%)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="hsl(42 48% 52%)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        <line
          x1={geometry.plotLeft}
          y1={geometry.plotTop}
          x2={geometry.plotLeft}
          y2={geometry.plotBottom}
          stroke={CHART_AXIS}
          strokeOpacity={0.35}
        />
        <line
          x1={geometry.plotLeft}
          y1={geometry.plotBottom}
          x2={geometry.plotRight}
          y2={geometry.plotBottom}
          stroke={CHART_AXIS}
          strokeOpacity={0.35}
        />

        {geometry.yTicks.map(({ t, value, y }) => (
          <g key={t}>
            <line
              x1={geometry.plotLeft}
              y1={y}
              x2={geometry.plotRight}
              y2={y}
              stroke={CHART_GRID}
              strokeOpacity={0.14}
              strokeDasharray={t === 0 ? undefined : "5 5"}
            />
            <text
              x={geometry.plotLeft - 12}
              y={y + 4}
              textAnchor="end"
              fill={CHART_TICK}
              fontSize={11}
              fontWeight={500}
            >
              {formatRevenueTick(value)}
            </text>
          </g>
        ))}

        <path d={geometry.areaPath} fill={`url(#${fillId})`} />
        <path
          d={geometry.linePath}
          fill="none"
          stroke="hsl(42 48% 52%)"
          strokeWidth={2.5}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {geometry.coords.map((coord) =>
          coord.amount > 0 ? (
            <g key={coord.month}>
              <circle
                cx={coord.x}
                cy={coord.y}
                r={9}
                fill="hsl(42 48% 52%)"
                fillOpacity={0.18}
              />
              <circle
                cx={coord.x}
                cy={coord.y}
                r={5.5}
                fill="hsl(42 48% 52%)"
                stroke="white"
                strokeWidth={2}
              />
              <text
                x={coord.x}
                y={coord.y - 14}
                textAnchor="middle"
                fill="hsl(42 40% 38%)"
                fontSize={11}
                fontWeight={700}
              >
                {formatLKR(coord.amount).replace("LKR ", "")}
              </text>
            </g>
          ) : null
        )}

        {geometry.coords.map((coord) => (
          <text
            key={`${coord.month}-label`}
            x={coord.x}
            y={geometry.plotBottom + 28}
            textAnchor="middle"
            fill={CHART_TICK}
            fontSize={11}
            fontWeight={500}
          >
            {coord.month.replace(/\s20\d{2}$/, "")}
          </text>
        ))}
      </svg>
    </VendorChartShell>
  );
}
