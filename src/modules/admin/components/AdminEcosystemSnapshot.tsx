"use client";

import type { PlatformAnalytics } from "@/shared/lib/api/admin";
import { ProgressBar } from "@/shared/components/ui";

export function AdminEcosystemSnapshot({ data }: { data: PlatformAnalytics }) {
  const total = Math.max(data.totalUsers, data.totalEvents, data.totalBookings, 1);

  return (
    <div className="space-y-5">
      <ProgressBar
        label="Registered users"
        count={data.totalUsers}
        total={total}
        barClassName="bg-primary"
      />
      <ProgressBar
        label="Wedding events"
        count={data.totalEvents}
        total={total}
        barClassName="bg-accent"
      />
      <ProgressBar
        label="Vendor bookings"
        count={data.totalBookings}
        total={total}
        barClassName="bg-success"
      />
      <p className="border-t border-border pt-4 text-xs text-muted-foreground">
        Live counts from platform database — use for capacity planning and support load.
      </p>
    </div>
  );
}
