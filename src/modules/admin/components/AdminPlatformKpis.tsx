"use client";

import { ClipboardList, ShieldAlert, TrendingUp, Users, Wallet } from "lucide-react";
import type { PayoutDueItem, PendingVendor, PlatformAnalytics } from "@/shared/lib/api/admin";
import { GlassStatCard } from "@/modules/vendor/dashboard/glass-ui";
import { formatLKR } from "@/shared/components/ui";

function deltaTrend(delta: number | undefined) {
  if (delta === undefined) return undefined;
  return `${delta >= 0 ? "+" : ""}${delta}% MoM`;
}

function kpiSub(base: string, delta: number | undefined) {
  const trend = deltaTrend(delta);
  return trend ? `${base} · ${trend}` : base;
}

type AdminPlatformKpisProps = {
  data: PlatformAnalytics;
  pendingVendors: PendingVendor[];
  payoutsDue: PayoutDueItem[];
};

export function AdminPlatformKpis({ data, pendingVendors, payoutsDue }: AdminPlatformKpisProps) {
  const payoutCommission = payoutsDue.reduce((sum, row) => sum + row.commissionAmount, 0);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <GlassStatCard
        label="MRR"
        value={formatLKR(data.mrr)}
        sub={kpiSub("Planner subscriptions", data.mrrDeltaPct)}
        icon={Wallet}
        iconTheme="accent"
      />
      <GlassStatCard
        label="TPV"
        value={formatLKR(data.tpv)}
        sub={kpiSub("Booking volume", data.tpvDeltaPct)}
        icon={TrendingUp}
        iconTheme="primary"
      />
      <GlassStatCard
        label="Take rate"
        value={formatLKR(data.takeRateRevenue)}
        sub="Platform commission earned"
        icon={ClipboardList}
        iconTheme="warning"
      />
      <GlassStatCard
        label="KYB pending"
        value={pendingVendors.length}
        sub={pendingVendors.length > 0 ? "Awaiting verification" : "Queue clear"}
        icon={ShieldAlert}
        iconTheme={pendingVendors.length > 0 ? "warning" : "success"}
      />
      <GlassStatCard
        label="Unsettled payouts"
        value={payoutsDue.length}
        sub={
          payoutsDue.length > 0
            ? `${formatLKR(payoutCommission)} commission`
            : "Nothing due"
        }
        icon={Wallet}
        iconTheme={payoutsDue.length > 0 ? "warning" : "success"}
      />
      <GlassStatCard
        label="Active planners"
        value={data.activePlanners}
        sub={`${data.registeredVendors} vendors · ${data.totalBookings} bookings`}
        icon={Users}
        iconTheme="primary"
      />
    </div>
  );
}
