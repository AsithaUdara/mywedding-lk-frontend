"use client";

import type { PlatformAnalytics } from "@/shared/lib/api/admin";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

export function AdminGrowthChart({
  points,
  max,
}: {
  points: PlatformAnalytics["plannerGrowthByMonth"];
  max: number;
}) {
  if (points.length === 0) {
    return <p className={vg.subtitle}>No planner growth data yet.</p>;
  }

  return (
    <div
      className="flex h-40 items-end gap-2 sm:gap-3"
      role="img"
      aria-label="Active planners over the last six months"
    >
      {points.map((point) => (
        <div key={point.month} className="group flex flex-1 flex-col items-center gap-2">
          <span className="text-[10px] font-bold tabular-nums text-primary">{point.count}</span>
          <div
            className="w-full min-h-[6px] rounded-t-lg bg-primary transition-colors duration-300 group-hover:bg-primary/80"
            style={{ height: `${Math.max(10, Math.round((point.count / max) * 140))}px` }}
            title={`${point.count} planners in ${point.month}`}
          />
          <span className={cn("text-[10px] font-medium", vg.caption)}>{point.month}</span>
        </div>
      ))}
    </div>
  );
}
