"use client";

import { Store, TrendingUp, Users, Wallet, Percent } from "lucide-react";
import type { PlatformAnalytics } from "@/shared/lib/api/admin";
import { StatCard, formatLKR } from "@/shared/components/ui";

function deltaTrend(delta: number | undefined) {
  if (delta === undefined) return undefined;
  return `${delta >= 0 ? "+" : ""}${delta}% MoM`;
}

function deltaTone(delta: number | undefined): "success" | "attention" | "neutral" {
  if (delta === undefined) return "neutral";
  return delta >= 0 ? "success" : "attention";
}

export function AdminPlatformKpis({ data }: { data: PlatformAnalytics }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard
        label="MRR"
        value={formatLKR(data.mrr)}
        sub="Planner SaaS"
        icon={Wallet}
        iconTheme="accent"
        trend={deltaTrend(data.mrrDeltaPct)}
        trendTone={deltaTone(data.mrrDeltaPct)}
        index={0}
      />
      <StatCard
        label="TPV"
        value={formatLKR(data.tpv)}
        sub="Processing volume"
        icon={TrendingUp}
        iconTheme="primary"
        trend={deltaTrend(data.tpvDeltaPct)}
        trendTone={deltaTone(data.tpvDeltaPct)}
        index={1}
      />
      <StatCard
        label="Take rate"
        value={formatLKR(data.takeRateRevenue)}
        sub="Platform commission"
        icon={Percent}
        iconTheme="rose"
        index={2}
      />
      <StatCard
        label="Active planners"
        value={data.activePlanners}
        sub="Last 30 days"
        icon={Users}
        iconTheme="primary"
        index={3}
      />
      <StatCard
        label="Vendors"
        value={data.registeredVendors}
        sub={`${data.activeCouples} active couples`}
        icon={Store}
        iconTheme="success"
        index={4}
      />
    </div>
  );
}
