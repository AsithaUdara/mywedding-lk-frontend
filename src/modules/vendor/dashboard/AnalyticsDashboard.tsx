"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Loader2, MessageSquare, Trophy, TrendingUp } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  getVendorInquiryTrend,
  getVendorProfileViews,
  getVendorWinRate,
  MonthlyCountPoint,
  WeeklyViewPoint,
  WinRateSummary,
} from "@/shared/lib/api/vendors";
import { bento } from "./bento";

type AnalyticsDashboardProps = {
  compact?: boolean;
};

export function AnalyticsDashboard({ compact = false }: AnalyticsDashboardProps) {
  const { user } = useAuth();
  const [profileViews, setProfileViews] = useState<WeeklyViewPoint[]>([]);
  const [inquiryTrend, setInquiryTrend] = useState<MonthlyCountPoint[]>([]);
  const [winRate, setWinRate] = useState<WinRateSummary>({ won: 0, pending: 0, lost: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const [views, inquiries, win] = await Promise.all([
        getVendorProfileViews(token, 6),
        getVendorInquiryTrend(token, 6),
        getVendorWinRate(token),
      ]);
      setProfileViews(views);
      setInquiryTrend(inquiries);
      setWinRate(win);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const viewsMax = useMemo(() => Math.max(...profileViews.map((d) => d.views), 1), [profileViews]);
  const inquiriesMax = useMemo(() => Math.max(...inquiryTrend.map((d) => d.count), 1), [inquiryTrend]);
  const totalViews = useMemo(() => profileViews.reduce((s, p) => s + p.views, 0), [profileViews]);
  const totalInquiries = useMemo(() => inquiryTrend.reduce((s, p) => s + p.count, 0), [inquiryTrend]);
  const winTotal = winRate.won + winRate.pending + winRate.lost;
  const winPct = winTotal > 0 ? Math.round((winRate.won / winTotal) * 100) : 0;

  const winSegments = [
    { label: "Won", value: winRate.won, color: "bg-emerald-500" },
    { label: "Pending", value: winRate.pending, color: "bg-orange-300" },
    { label: "Lost", value: winRate.lost, color: "bg-slate-200" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <Loader2 className="mr-2 animate-spin" size={20} />
        Loading analytics…
      </div>
    );
  }

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      {!compact && (
        <header className={bento.card}>
          <p className={bento.label}>Performance</p>
          <h2 className={`mt-2 ${bento.title}`}>Analytics Dashboard</h2>
          <p className={`mt-1 ${bento.subtitle}`}>
            Live storefront metrics from your database — profile reach, inquiry volume, and win rate.
          </p>
        </header>
      )}

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <article className={`col-span-12 md:col-span-4 ${bento.cardCompact}`}>
          <div className="flex items-center gap-3">
            <div className={bento.iconWrap("bg-violet-100/80 text-violet-800/90")}>
              <Eye size={18} />
            </div>
            <div>
              <p className={bento.label}>Profile views</p>
              <p className="font-playfair text-2xl font-bold tracking-tight text-charcoal tabular-nums sm:text-3xl">
                {totalViews.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-slate-500">Last 6 weeks</p>
            </div>
          </div>
        </article>

        <article className={`col-span-12 md:col-span-4 ${bento.cardCompact}`}>
          <div className="flex items-center gap-3">
            <div className={bento.iconWrap("bg-rose-100/80 text-rose-800/90")}>
              <MessageSquare size={18} />
            </div>
            <div>
              <p className={bento.label}>Inquiries received</p>
              <p className="font-playfair text-2xl font-bold tracking-tight text-charcoal tabular-nums sm:text-3xl">
                {totalInquiries}
              </p>
              <p className="mt-1 text-xs text-slate-500">Last 6 months</p>
            </div>
          </div>
        </article>

        <article className={`col-span-12 md:col-span-4 ${bento.cardCompact}`}>
          <div className="flex items-center gap-3">
            <div className={bento.iconWrap("bg-emerald-100/80 text-emerald-800/90")}>
              <Trophy size={18} />
            </div>
            <div>
              <p className={bento.label}>Win rate</p>
              <p className="font-playfair text-2xl font-bold tracking-tight text-charcoal tabular-nums sm:text-3xl">
                {winPct}%
              </p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                <TrendingUp size={12} />
                Leads → confirmed bookings
              </p>
            </div>
          </div>
        </article>

        <article className={`col-span-12 lg:col-span-7 ${bento.card}`}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className={bento.label}>Profile views</p>
              <p className="text-sm font-medium text-slate-600">Weekly trend</p>
            </div>
          </div>
          <div className="flex h-40 items-end gap-2">
            {profileViews.length === 0 && (
              <p className="text-sm text-slate-400">No profile views recorded yet.</p>
            )}
            {profileViews.map((point) => (
              <div key={point.week} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-xl bg-gradient-to-t from-charcoal to-slate-600 transition-all duration-300 ease-in-out hover:from-violet-900 hover:to-violet-600"
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
                background:
                  winTotal > 0
                    ? `conic-gradient(
                  #10b981 0 ${(winRate.won / winTotal) * 100}%,
                  #fdba74 ${(winRate.won / winTotal) * 100}% ${((winRate.won + winRate.pending) / winTotal) * 100}%,
                  #e2e8f0 ${((winRate.won + winRate.pending) / winTotal) * 100}% 100%
                )`
                    : "#e2e8f0",
              }}
            >
              <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-white">
                <span className="text-2xl font-bold text-slate-900">{winPct}%</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400">Won</span>
              </div>
            </div>
            <ul className="space-y-2 text-sm">
              {winSegments.map((seg) => (
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
          <p className="mt-1 text-sm text-slate-500">Last 6 months</p>
          <div className="mt-6 flex h-36 items-end gap-3">
            {inquiryTrend.map((row) => (
              <div key={row.month} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-bold text-slate-700">{row.count}</span>
                <div
                  className="w-full rounded-t-2xl bg-rose-300/90 transition-all duration-300 ease-in-out hover:bg-rose-400/90"
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
