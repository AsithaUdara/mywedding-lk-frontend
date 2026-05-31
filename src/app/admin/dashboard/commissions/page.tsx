"use client";

import { useState } from "react";
import { RefreshCw, Wallet } from "lucide-react";
import { CommissionsPayoutQueue } from "@/modules/admin/CommissionsPayoutQueue";
import {
  GlassButton,
  GlassPageHeader,
  GlassSectionCard,
  GlassStatCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { formatLKR } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";

type QueueStats = {
  count: number;
  totalCommission: number;
  totalVendorNet: number;
};

export default function AdminCommissionsPage() {
  const [stats, setStats] = useState<QueueStats | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-8 pb-4 lg:space-y-10">
      <GlassPageHeader
        title="Commission payouts"
        description="Review unsettled vendor payouts from confirmed bookings and mark them settled after bank transfer."
        badge={
          <span className={cn(rf.badge, "inline-flex items-center gap-1.5 text-accent")}>
            <Wallet size={12} aria-hidden />
            Financials
          </span>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            {stats !== undefined && (
              <span className={cn(rf.badge, "tabular-nums")}>
                {stats.count} unsettled
              </span>
            )}
            <GlassButton
              type="button"
              variant="ghost"
              className="gap-1.5"
              onClick={() => setRefreshKey((k) => k + 1)}
            >
              <RefreshCw size={16} aria-hidden />
              Refresh
            </GlassButton>
          </div>
        }
      />

      {stats !== undefined && stats.count > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <GlassStatCard
            label="Unsettled payouts"
            value={stats.count}
            sub="Awaiting vendor transfer"
            icon={Wallet}
            iconTheme="warning"
          />
          <GlassStatCard
            label="Vendor net due"
            value={formatLKR(stats.totalVendorNet)}
            sub="Total owed to vendors"
            iconTheme="accent"
          />
          <GlassStatCard
            label="Platform commission"
            value={formatLKR(stats.totalCommission)}
            sub="Retained from gross bookings"
            iconTheme="primary"
          />
        </div>
      )}

      <GlassSectionCard
        title="Unsettled vendor payouts"
        subtitle="Commission splits awaiting manual payout to vendors after client deposits"
      >
        <CommissionsPayoutQueue key={refreshKey} onQueueStats={setStats} />
      </GlassSectionCard>
    </div>
  );
}
