"use client";

import { useId, useMemo } from "react";
import type { PlatformAnalytics } from "@/shared/lib/api/admin";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

const CHART = {
  width: 1000,
  height: 260,
  marginLeft: 48,
  marginRight: 24,
  marginTop: 36,
  marginBottom: 44,
};

function computeYMax(points: { count: number }[], maxProp?: number) {
  const peak = Math.max(0, ...points.map((p) => p.count), maxProp ?? 0);
  if (peak === 0) return 1;
  return Math.max(Math.ceil(peak * 1.15), peak + 1);
}

function xForIndex(index: number, count: number, plotLeft: number, plotWidth: number) {
  if (count <= 1) return plotLeft + plotWidth / 2;
  return plotLeft + (index / (count - 1)) * plotWidth;
}

export function AdminGrowthChart({
  points,
  max,
  className,
}: {
  points: PlatformAnalytics["plannerGrowthByMonth"];
  max?: number;
  className?: string;
}) {
  const fillId = useId().replace(/:/g, "");
  const yMax = useMemo(() => computeYMax(points, max), [points, max]);

  if (points.length === 0) {
    return <p className={vg.subtitle}>No planner growth data yet.</p>;
  }

  const { width, height, marginLeft, marginRight, marginTop, marginBottom } = CHART;
  const plotLeft = marginLeft;
  const plotRight = width - marginRight;
  const plotTop = marginTop;
  const plotBottom = height - marginBottom;
  const plotWidth = plotRight - plotLeft;
  const plotHeight = plotBottom - plotTop;

  const coords = points.map((point, i) => {
    const x = xForIndex(i, points.length, plotLeft, plotWidth);
    const y = plotBottom - (point.count / yMax) * plotHeight;
    return { ...point, x, y };
  });

  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`)
    .join(" ");
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(2)} ${plotBottom} L ${coords[0].x.toFixed(2)} ${plotBottom} Z`;

  const yTicks = [0, 0.5, 1].map((t) => ({
    t,
    value: Math.round(yMax * t),
    y: plotBottom - t * plotHeight,
  }));

  return (
    <div className={cn("min-h-[240px] w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="block h-full min-h-[240px] w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="Active planners over the last six months"
      >
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(345 100% 25%)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="hsl(345 100% 25%)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <line
          x1={plotLeft}
          y1={plotTop}
          x2={plotLeft}
          y2={plotBottom}
          stroke="hsl(345 20% 50%)"
          strokeOpacity={0.2}
        />

        {yTicks.map(({ t, value, y }) => (
          <g key={t}>
            <line
              x1={plotLeft}
              y1={y}
              x2={plotRight}
              y2={y}
              stroke="hsl(345 20% 50%)"
              strokeOpacity={0.12}
              strokeDasharray={t === 0 ? undefined : "4 4"}
            />
            <text
              x={plotLeft - 12}
              y={y + 4}
              textAnchor="end"
              fill="hsl(345 10% 45%)"
              fontSize={11}
              fontWeight={500}
            >
              {value}
            </text>
          </g>
        ))}

        <line
          x1={plotLeft}
          y1={plotBottom}
          x2={plotRight}
          y2={plotBottom}
          stroke="hsl(345 20% 50%)"
          strokeOpacity={0.2}
        />

        <path d={areaPath} fill={`url(#${fillId})`} />
        <path
          d={linePath}
          fill="none"
          stroke="hsl(345 100% 25%)"
          strokeWidth={2.5}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {coords.map((c) => (
          <g key={c.month}>
            <circle cx={c.x} cy={c.y} r={8} fill="hsl(345 100% 25%)" fillOpacity={0.15} />
            <circle cx={c.x} cy={c.y} r={5} fill="hsl(345 100% 25%)" stroke="white" strokeWidth={1.5} />
            <text
              x={c.x}
              y={c.y - 14}
              textAnchor="middle"
              fill="hsl(345 100% 25%)"
              fontSize={12}
              fontWeight={700}
            >
              {c.count}
            </text>
            <text
              x={c.x}
              y={plotBottom + 28}
              textAnchor="middle"
              fill="hsl(345 10% 45%)"
              fontSize={11}
              fontWeight={500}
            >
              {c.month}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
