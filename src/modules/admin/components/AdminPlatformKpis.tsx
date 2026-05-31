"use client";

import { Store, TrendingUp, Users, Wallet, Percent } from "lucide-react";
import type { PlatformAnalytics } from "@/shared/lib/api/admin";
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

export function AdminPlatformKpis({ data }: { data: PlatformAnalytics }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <GlassStatCard
        label="MRR"
        value={formatLKR(data.mrr)}
        sub={kpiSub("Planner SaaS", data.mrrDeltaPct)}
        icon={Wallet}
        iconTheme="accent"
      />
      <GlassStatCard
        label="TPV"
        value={formatLKR(data.tpv)}
        sub={kpiSub("Processing volume", data.tpvDeltaPct)}
        icon={TrendingUp}
        iconTheme="primary"
      />
      <GlassStatCard
        label="Take rate"
        value={formatLKR(data.takeRateRevenue)}
        sub="Platform commission"
        icon={Percent}
        iconTheme="warning"
      />
      <GlassStatCard
        label="Active planners"
        value={data.activePlanners}
        sub="Last 30 days"
        icon={Users}
        iconTheme="primary"
      />
      <GlassStatCard
        label="Vendors"
        value={data.registeredVendors}
        sub={`${data.activeCouples} active couples`}
        icon={Store}
        iconTheme="success"
      />
    </div>
  );
}
