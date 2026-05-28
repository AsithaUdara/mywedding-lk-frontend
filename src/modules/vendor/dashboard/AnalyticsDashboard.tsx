"use client";

import { useMemo } from "react";
import { Eye, MessageSquare, Trophy, TrendingUp } from "lucide-react";
import { bento } from "./bento";

const PROFILE_VIEWS = [
  { week: "W1", views: 420 },
  { week: "W2", views: 580 },
  { week: "W3", views: 510 },
  { week: "W4", views: 720 },
  { week: "W5", views: 890 },
  { week: "W6", views: 1040 },
];

const INQUIRIES_MONTHLY = [
  { month: "Jan", count: 8 },
  { month: "Feb", count: 12 },
  { month: "Mar", count: 15 },
  { month: "Apr", count: 11 },
  { month: "May", count: 18 },
  { month: "Jun", count: 22 },
];

const WIN_RATE_SEGMENTS = [
  { label: "Won", value: 34, color: "bg-emerald-500" },
  { label: "Pending", value: 28, color: "bg-orange-300" },
  { label: "Lost", value: 18, color: "bg-slate-200" },
];

type AnalyticsDashboardProps = {
  compact?: boolean;
};

export function AnalyticsDashboard({ compact = false }: AnalyticsDashboardProps) {
  const viewsMax = useMemo(() => Math.max(...PROFILE_VIEWS.map((d) => d.views), 1), []);
  const inquiriesMax = useMemo(() => Math.max(...INQUIRIES_MONTHLY.map((d) => d.count), 1), []);
  const winTotal = WIN_RATE_SEGMENTS.reduce((s, x) => s + x.value, 0);
  const winPct = Math.round((WIN_RATE_SEGMENTS[0].value / winTotal) * 100);

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      {!compact && (
        <header className={bento.card}>
          <p className={bento.label}>Performance</p>
          <h2 className={`mt-2 ${bento.title}`}>Analytics Dashboard</h2>
          <p className={`mt-1 ${bento.subtitle}`}>
            Mocked storefront metrics — profile reach, inquiry volume, and conversion win rate.
          </p>
        </header>
      )}

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <article className={`col-span-12 md:col-span-4 ${bento.cardCompact}`}>
          <div className="flex items-center gap-3">
            <div className={bento.iconWrap("bg-indigo-50 text-indigo-500")}>
              <Eye size={18} />
            </div>
            <div>
              <p className={bento.label}>Profile views</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">4,160</p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <TrendingUp size={12} />
                +18% vs last month
              </p>
            </div>
          </div>
        </article>

        <article className={`col-span-12 md:col-span-4 ${bento.cardCompact}`}>
          <div className="flex items-center gap-3">
            <div className={bento.iconWrap("bg-fuchsia-50 text-fuchsia-600")}>
              <MessageSquare size={18} />
            </div>
            <div>
              <p className={bento.label}>Inquiries received</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">86</p>
              <p className="mt-1 text-xs text-slate-500">22 this month (mock)</p>
            </div>
          </div>
        </article>

        <article className={`col-span-12 md:col-span-4 ${bento.cardCompact}`}>
          <div className="flex items-center gap-3">
            <div className={bento.iconWrap("bg-emerald-50 text-emerald-600")}>
              <Trophy size={18} />
            </div>
            <div>
              <p className={bento.label}>Win rate</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">{winPct}%</p>
              <p className="mt-1 text-xs text-slate-500">Leads → confirmed bookings</p>
            </div>
          </div>
        </article>

        <article className={`col-span-12 lg:col-span-7 ${bento.card}`}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className={bento.label}>Profile views</p>
              <p className="text-sm font-semibold text-slate-800">Weekly trend (mock)</p>
            </div>
          </div>
          <div className="flex h-40 items-end gap-2">
            {PROFILE_VIEWS.map((point) => (
              <div key={point.week} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-xl bg-gradient-to-t from-slate-900 to-slate-600"
                  style={{ height: `${Math.round((point.views / viewsMax) * 128)}px` }}
                />
                <span className="text-[10px] font-medium text-slate-400">{point.week}</span>
              </div>
            ))}
          </div>
        </article>

        <article className={`col-span-12 lg:col-span-5 ${bento.card}`}>
          <p className={bento.label}>Win rate breakdown</p>
          <div className="mt-4 flex items-center gap-6">
            <div
              className="relative h-32 w-32 flex-shrink-0 rounded-full"
              style={{
                background: `conic-gradient(
                  #10b981 0 ${(WIN_RATE_SEGMENTS[0].value / winTotal) * 100}%,
                  #fdba74 ${(WIN_RATE_SEGMENTS[0].value / winTotal) * 100}% ${((WIN_RATE_SEGMENTS[0].value + WIN_RATE_SEGMENTS[1].value) / winTotal) * 100}%,
                  #e2e8f0 ${((WIN_RATE_SEGMENTS[0].value + WIN_RATE_SEGMENTS[1].value) / winTotal) * 100}% 100%
                )`,
              }}
            >
              <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-white">
                <span className="text-2xl font-bold text-slate-900">{winPct}%</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400">Won</span>
              </div>
            </div>
            <ul className="space-y-2 text-sm">
              {WIN_RATE_SEGMENTS.map((seg) => (
                <li key={seg.label} className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className={`h-2.5 w-2.5 rounded-full ${seg.color}`} />
                    {seg.label}
                  </span>
                  <span className="font-semibold text-slate-900">{seg.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>

        <article className={`col-span-12 ${bento.card}`}>
          <p className={bento.label}>Inquiries received</p>
          <p className="mt-1 text-sm text-slate-500">Last 6 months (mock)</p>
          <div className="mt-6 flex h-36 items-end gap-3">
            {INQUIRIES_MONTHLY.map((row) => (
              <div key={row.month} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-bold text-slate-700">{row.count}</span>
                <div
                  className="w-full rounded-t-2xl bg-fuchsia-400/80"
                  style={{ height: `${Math.round((row.count / inquiriesMax) * 100)}px` }}
                />
                <span className="text-[10px] font-medium text-slate-400">{row.month}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
