"use client";

import { useMemo } from "react";
import { AdminPanel } from "./tables";

/** Mock platform financial & growth metrics — Phase 7 UI (wire to API later). */
const MOCK = {
  mrr: 1_245_000,
  mrrDeltaPct: 8.4,
  tpv: 48_750_000,
  tpvDeltaPct: 12.1,
  takeRateRevenue: 2_437_500,
  activePlanners: 34,
  activeCouples: 412,
  registeredVendors: 186,
  plannerGrowth: [
    { month: "Dec", count: 22 },
    { month: "Jan", count: 24 },
    { month: "Feb", count: 26 },
    { month: "Mar", count: 28 },
    { month: "Apr", count: 31 },
    { month: "May", count: 34 },
  ],
};

function formatLKR(amount: number) {
  if (amount >= 1_000_000) return `LKR ${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `LKR ${(amount / 1_000).toFixed(0)}K`;
  return `LKR ${amount.toLocaleString()}`;
}

function MetricCell({
  label,
  value,
  sub,
  delta,
}: {
  label: string;
  value: string;
  sub?: string;
  delta?: number;
}) {
  return (
    <div className="border-r border-neutral-300 px-4 py-3 last:border-r-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">{label}</p>
      <p className="mt-1 font-mono text-xl font-bold tabular-nums text-neutral-900">{value}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
        {sub && <span>{sub}</span>}
        {delta !== undefined && (
          <span className={delta >= 0 ? "font-semibold text-emerald-700" : "font-semibold text-red-600"}>
            {delta >= 0 ? "+" : ""}
            {delta}% MoM
          </span>
        )}
      </div>
    </div>
  );
}

export function PlatformAnalyticsDashboard() {
  const growthMax = useMemo(
    () => Math.max(...MOCK.plannerGrowth.map((p) => p.count), 1),
    []
  );

  return (
    <div className="space-y-4">
      <AdminPanel title="Platform analytics" subtitle="Financial health & ecosystem growth (mocked)">
        <div className="grid grid-cols-1 divide-y divide-neutral-300 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-5 lg:divide-x lg:divide-y-0">
          <MetricCell
            label="MRR"
            value={formatLKR(MOCK.mrr)}
            sub="Planner SaaS subscriptions"
            delta={MOCK.mrrDeltaPct}
          />
          <MetricCell
            label="TPV"
            value={formatLKR(MOCK.tpv)}
            sub="Total processing volume"
            delta={MOCK.tpvDeltaPct}
          />
          <MetricCell
            label="Take rate revenue"
            value={formatLKR(MOCK.takeRateRevenue)}
            sub="Platform commission (mock 5%)"
          />
          <MetricCell
            label="Active planners"
            value={String(MOCK.activePlanners)}
            sub="Paid or trialing in last 30d"
          />
          <MetricCell
            label="Registered vendors"
            value={String(MOCK.registeredVendors)}
            sub={`${MOCK.activeCouples} active couples`}
          />
        </div>
      </AdminPanel>

      <AdminPanel title="Active planners — 6 month trend" subtitle="User growth (mock)">
        <div className="px-4 py-4">
          <div className="flex h-28 items-end gap-1 border-b border-neutral-200 pb-1">
            {MOCK.plannerGrowth.map((point) => (
              <div key={point.month} className="flex flex-1 flex-col items-center gap-1">
                <span className="font-mono text-[10px] font-semibold text-neutral-700">{point.count}</span>
                <div
                  className="w-full bg-neutral-700"
                  style={{ height: `${Math.round((point.count / growthMax) * 88)}px` }}
                />
                <span className="text-[10px] text-neutral-500">{point.month}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-neutral-500">
            Couples: {MOCK.activeCouples} active · Vendors: {MOCK.registeredVendors} on directory (incl. pending KYB)
          </p>
        </div>
      </AdminPanel>
    </div>
  );
}
