"use client";

import type { PlatformAnalytics } from "@/shared/lib/api/admin";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

function GlassProgressBar({
  label,
  count,
  total,
  barClassName,
}: {
  label: string;
  count: number;
  total: number;
  barClassName: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className={cn("font-medium", vg.subtitle)}>{label}</span>
        <span className="font-bold tabular-nums text-foreground">
          {count} <span className={cn("font-normal", vg.subtitle)}>({pct}%)</span>
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/50 ring-1 ring-white/60">
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", barClassName)}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

export function AdminEcosystemSnapshot({ data }: { data: PlatformAnalytics }) {
  const total = Math.max(data.totalUsers, data.totalEvents, data.totalBookings, 1);

  return (
    <div className="space-y-5">
      <GlassProgressBar
        label="Registered users"
        count={data.totalUsers}
        total={total}
        barClassName="bg-primary"
      />
      <GlassProgressBar
        label="Wedding events"
        count={data.totalEvents}
        total={total}
        barClassName="bg-accent"
      />
      <GlassProgressBar
        label="Vendor bookings"
        count={data.totalBookings}
        total={total}
        barClassName="bg-success"
      />
      <p className={cn("border-t border-white/40 pt-4", vg.caption)}>
        Live counts from platform database — use for capacity planning and support load.
      </p>
    </div>
  );
}
