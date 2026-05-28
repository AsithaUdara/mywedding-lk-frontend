"use client";

import { useMemo } from "react";
import { AdminPanel } from "./tables";

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
    <div className="border-b border-slate-100/80 p-6 transition-all duration-300 ease-in-out last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 font-playfair text-2xl font-bold tracking-tight text-charcoal tabular-nums sm:text-3xl">
        {value}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        {sub && <span>{sub}</span>}
        {delta !== undefined && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              delta >= 0 ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
            }`}
          >
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
    <div className="space-y-6 lg:space-y-8">
      <AdminPanel
        title="Platform analytics"
        subtitle="Financial health & ecosystem growth (mocked)"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCell
            label="MRR"
            value={formatLKR(MOCK.mrr)}
            sub="Planner SaaS"
            delta={MOCK.mrrDeltaPct}
          />
          <MetricCell
            label="TPV"
            value={formatLKR(MOCK.tpv)}
            sub="Processing volume"
            delta={MOCK.tpvDeltaPct}
          />
          <MetricCell
            label="Take rate"
            value={formatLKR(MOCK.takeRateRevenue)}
            sub="Platform commission"
          />
          <MetricCell
            label="Active planners"
            value={String(MOCK.activePlanners)}
            sub="Last 30 days"
          />
          <MetricCell
            label="Vendors"
            value={String(MOCK.registeredVendors)}
            sub={`${MOCK.activeCouples} active couples`}
          />
        </div>
      </AdminPanel>

      <AdminPanel title="Planner growth" subtitle="Active planners — 6 month trend (mock)">
        <div className="px-6 py-6 sm:px-8 sm:py-8">
          <div className="flex h-36 items-end gap-2 border-b border-slate-100 pb-2 sm:gap-3">
            {MOCK.plannerGrowth.map((point) => (
              <div
                key={point.month}
                className="group flex flex-1 flex-col items-center gap-2 transition-all duration-300 ease-in-out"
              >
                <span className="text-xs font-semibold tabular-nums text-slate-600">{point.count}</span>
                <div
                  className="w-full rounded-t-xl bg-gradient-to-t from-charcoal to-slate-600 transition-all duration-300 ease-in-out group-hover:from-violet-900 group-hover:to-violet-500"
                  style={{ height: `${Math.round((point.count / growthMax) * 112)}px` }}
                />
                <span className="text-[11px] font-medium text-slate-400">{point.month}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-slate-500">
            {MOCK.activeCouples} active couples · {MOCK.registeredVendors} vendors on directory
          </p>
        </div>
      </AdminPanel>
    </div>
  );
}
