"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  Eye,
  Inbox,
  Loader2,
  MessageSquare,
  RefreshCw,
  Star,
  Store,
  TrendingUp,
  Trophy,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  getVendorAnalytics,
  getVendorInquiryTrend,
  getVendorProfileViews,
  getVendorWinRate,
  MonthlyCountPoint,
  VendorAnalytics,
  WeeklyViewPoint,
  WinRateSummary,
} from "@/shared/lib/api/vendors";
import {
  Button,
  Card,
  EmptyState,
  ErrorBanner,
  PageHeader,
  PageLoadingSkeleton,
  QuickActionLink,
  SectionCard,
  StatCard,
  formatLKR,
} from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";

type AnalyticsDashboardProps = {
  /** Overview embed — KPIs + charts only */
  compact?: boolean;
  /** Dedicated /vendor/dashboard/analytics page */
  fullPage?: boolean;
};

const WIN_SEGMENT_CLASS = {
  won: "bg-primary",
  pending: "bg-warning",
  lost: "bg-muted",
} as const;

function buildWinConic(win: WinRateSummary, total: number): string {
  if (total <= 0) return "hsl(var(--muted))";
  const wonEnd = (win.won / total) * 100;
  const pendingEnd = ((win.won + win.pending) / total) * 100;
  return `conic-gradient(
    hsl(var(--primary)) 0 ${wonEnd}%,
    hsl(var(--warning)) ${wonEnd}% ${pendingEnd}%,
    hsl(var(--muted)) ${pendingEnd}% 100%
  )`;
}

function WeeklyViewsChart({
  data,
  max,
}: {
  data: WeeklyViewPoint[];
  max: number;
}) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No profile views recorded yet.</p>;
  }

  return (
    <div
      className="flex h-40 items-end gap-2"
      role="img"
      aria-label="Weekly profile views for the last six weeks"
    >
      {data.map((point) => (
        <div key={point.week} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-[10px] font-bold tabular-nums text-primary">{point.views}</span>
          <div
            className="w-full min-h-[4px] rounded-t-lg bg-primary transition-colors duration-300 hover:bg-primary/80"
            style={{ height: `${Math.max(8, Math.round((point.views / max) * 128))}px` }}
            title={`${point.views} views`}
          />
          <span className="text-[10px] font-medium text-muted-foreground">{point.week}</span>
        </div>
      ))}
    </div>
  );
}

function MonthlyCountChart({
  data,
  max,
  barClassName = "bg-primary/70 hover:bg-primary",
  valueClassName = "text-primary",
  emptyLabel,
}: {
  data: MonthlyCountPoint[];
  max: number;
  barClassName?: string;
  valueClassName?: string;
  emptyLabel: string;
}) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="flex h-36 items-end gap-3" role="img" aria-label="Monthly counts">
      {data.map((row) => (
        <div key={row.month} className="flex flex-1 flex-col items-center gap-2">
          <span className={cn("text-xs font-bold tabular-nums", valueClassName)}>{row.count}</span>
          <div
            className={cn("w-full min-h-[4px] rounded-t-xl transition-colors", barClassName)}
            style={{ height: `${Math.max(8, Math.round((row.count / max) * 100))}px` }}
          />
          <span className="text-[10px] font-medium text-muted-foreground">{row.month}</span>
        </div>
      ))}
    </div>
  );
}

function MonthlyEarningsChart({
  data,
  max,
}: {
  data: { month: string; amount: number }[];
  max: number;
}) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No confirmed or completed bookings yet.</p>;
  }

  return (
    <div
      className="flex h-36 items-end gap-3"
      role="img"
      aria-label="Monthly earnings from confirmed and completed bookings"
    >
      {data.map((row) => (
        <div key={row.month} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-[9px] font-bold tabular-nums text-accent sm:text-xs">
            {row.amount > 0 ? formatLKR(row.amount) : "—"}
          </span>
          <div
            className="w-full min-h-[4px] rounded-t-xl bg-accent/80 transition-colors hover:bg-accent"
            style={{ height: `${Math.max(8, Math.round((row.amount / max) * 100))}px` }}
            title={formatLKR(row.amount)}
          />
          <span className="max-w-full truncate text-[9px] font-medium text-muted-foreground sm:text-[10px]">
            {row.month}
          </span>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsDashboard({ compact = false, fullPage = false }: AnalyticsDashboardProps) {
  const { user } = useAuth();
  const [profileViews, setProfileViews] = useState<WeeklyViewPoint[]>([]);
  const [inquiryTrend, setInquiryTrend] = useState<MonthlyCountPoint[]>([]);
  const [winRate, setWinRate] = useState<WinRateSummary>({ won: 0, pending: 0, lost: 0 });
  const [summary, setSummary] = useState<VendorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setError(null);
      const token = await user.getIdToken();
      const [views, inquiries, win, dashboard] = await Promise.all([
        getVendorProfileViews(token, 6),
        getVendorInquiryTrend(token, 6),
        getVendorWinRate(token),
        fullPage ? getVendorAnalytics(token) : Promise.resolve(null),
      ]);
      setProfileViews(views);
      setInquiryTrend(inquiries);
      setWinRate(win);
      setSummary(dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics.");
    }
  }, [user, fullPage]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) return;
      try {
        setLoading(true);
        await load();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load, user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const viewsMax = useMemo(() => Math.max(...profileViews.map((d) => d.views), 1), [profileViews]);
  const inquiriesMax = useMemo(() => Math.max(...inquiryTrend.map((d) => d.count), 1), [inquiryTrend]);
  const totalViews = useMemo(() => profileViews.reduce((s, p) => s + p.views, 0), [profileViews]);
  const totalInquiries = useMemo(() => inquiryTrend.reduce((s, p) => s + p.count, 0), [inquiryTrend]);
  const winTotal = winRate.won + winRate.pending + winRate.lost;
  const winPct = winTotal > 0 ? Math.round((winRate.won / winTotal) * 100) : 0;

  const earningsData = useMemo(
    () =>
      (summary?.monthlyEarnings ?? []).map((m) => ({
        month: m.month,
        amount: Number(m.amount),
      })),
    [summary]
  );
  const earningsMax = useMemo(
    () => Math.max(...earningsData.map((d) => d.amount), 1),
    [earningsData]
  );

  const isEmpty =
    !loading &&
    totalViews === 0 &&
    totalInquiries === 0 &&
    winTotal === 0 &&
    (summary == null ||
      (summary.totalBookings === 0 && summary.totalRevenue === 0 && summary.totalInquiries === 0));

  const winSegments = [
    { label: "Won", value: winRate.won, color: WIN_SEGMENT_CLASS.won },
    { label: "Pending", value: winRate.pending, color: WIN_SEGMENT_CLASS.pending },
    { label: "Lost", value: winRate.lost, color: WIN_SEGMENT_CLASS.lost },
  ];

  if (loading && !refreshing) {
    if (fullPage) return <PageLoadingSkeleton />;
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 animate-spin text-primary" size={20} aria-hidden />
        Loading analytics…
      </div>
    );
  }

  const chartsBlock = (
    <div className="grid gap-4 lg:grid-cols-12">
      {fullPage ? (
        <>
          <SectionCard
            title="Profile views"
            subtitle="Weekly trend — last 6 weeks"
            className="lg:col-span-7"
          >
            <WeeklyViewsChart data={profileViews} max={viewsMax} />
          </SectionCard>

          <SectionCard title="Win rate" subtitle="Leads converted to confirmed bookings" className="lg:col-span-5">
            <WinRateDonut winPct={winPct} winTotal={winTotal} winRate={winRate} segments={winSegments} />
            {winRate.pending > 0 && (
              <p className="mt-4 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{winRate.pending}</span> inquiries still in
                progress — follow up in your inbox to improve win rate.
              </p>
            )}
          </SectionCard>

          <SectionCard title="Inquiry volume" subtitle="Messages received per month" className="lg:col-span-6">
            <MonthlyCountChart
              data={inquiryTrend}
              max={inquiriesMax}
              emptyLabel="No inquiries in this period."
            />
          </SectionCard>

          <SectionCard
            title="Earnings"
            subtitle="Confirmed + completed bookings by service month"
            className="lg:col-span-6"
          >
            <MonthlyEarningsChart data={earningsData} max={earningsMax} />
          </SectionCard>
        </>
      ) : (
        <>
          <Card className="lg:col-span-7" padding>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Profile views
            </p>
            <p className="mt-0.5 text-sm font-medium text-foreground">Weekly trend</p>
            <div className="mt-6">
              <WeeklyViewsChart data={profileViews} max={viewsMax} />
            </div>
          </Card>

          <Card className="lg:col-span-5" padding>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Win rate breakdown
            </p>
            <div className="mt-4">
              <WinRateDonut winPct={winPct} winTotal={winTotal} winRate={winRate} segments={winSegments} />
            </div>
          </Card>

          <Card className="col-span-12 lg:col-span-12" padding>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Inquiries received
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">Last 6 months</p>
            <div className="mt-6">
              <MonthlyCountChart
                data={inquiryTrend}
                max={inquiriesMax}
                emptyLabel="No inquiries in this period."
              />
            </div>
          </Card>
        </>
      )}
    </div>
  );

  const body = (
    <div className={cn(compact ? "space-y-6" : "space-y-8")}>
      {error && <ErrorBanner message={error} />}

      {isEmpty && fullPage ? (
        <EmptyState
          title="No analytics yet"
          description="Complete your storefront profile, publish services, and respond to inquiries — activity will appear here."
          icon={TrendingUp}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button href="/vendor/dashboard/profile" variant="primary" size="sm">
                Complete profile
              </Button>
              <Button href="/vendor/dashboard/services" variant="secondary" size="sm">
                Add services
              </Button>
            </div>
          }
        />
      ) : (
        <>
          <div className={cn("grid gap-4", fullPage ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-3")}>
            <StatCard
              label="Profile views"
              value={totalViews.toLocaleString()}
              sub="Last 6 weeks"
              icon={Eye}
              iconTheme="primary"
              index={0}
            />
            <StatCard
              label="Inquiries received"
              value={totalInquiries}
              sub="Last 6 months"
              icon={MessageSquare}
              iconTheme="accent"
              index={1}
            />
            <StatCard
              label="Win rate"
              value={`${winPct}%`}
              sub="Leads → confirmed"
              icon={Trophy}
              iconTheme="success"
              index={2}
            />
          </div>

          {fullPage && summary && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total revenue"
                value={formatLKR(summary.totalRevenue)}
                sub={
                  summary.pendingRevenue > 0
                    ? `${formatLKR(summary.pendingRevenue)} pending`
                    : "Completed bookings"
                }
                icon={Wallet}
                iconTheme="accent"
                index={3}
              />
              <StatCard
                label="Confirmed bookings"
                value={summary.confirmedBookings}
                sub={`${summary.completedBookings} completed`}
                icon={Briefcase}
                iconTheme="primary"
                index={4}
              />
              <StatCard
                label="Average rating"
                value={summary.totalReviews > 0 ? summary.averageRating.toFixed(1) : "—"}
                sub={
                  summary.totalReviews > 0
                    ? `${summary.totalReviews} reviews`
                    : "No reviews yet"
                }
                icon={Star}
                iconTheme="warning"
                index={5}
              />
              <StatCard
                label="Active listings"
                value={summary.activeServices}
                sub={`${summary.totalServices} total services`}
                icon={Store}
                iconTheme="muted"
                index={6}
              />
            </div>
          )}

          {chartsBlock}
        </>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="space-y-8 pb-4">
        <PageHeader
          title="Analytics"
          description="Storefront reach, inquiry pipeline, bookings, and earnings — everything in one place."
          badge="Performance"
          action={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void handleRefresh()}
              disabled={refreshing}
            >
              <RefreshCw size={16} className={cn(refreshing && "animate-spin")} aria-hidden />
              Refresh
            </Button>
          }
        />

        <SectionCard title="Quick links" subtitle="Act on what the numbers show">
          <div className="grid gap-3 sm:grid-cols-3">
            <QuickActionLink
              href="/vendor/dashboard/inquiries"
              label="Inquiry inbox"
              description={
                summary && summary.unreadInquiries > 0
                  ? `${summary.unreadInquiries} unread`
                  : "Reply and send quotes"
              }
              icon={<Inbox size={18} />}
            />
            <QuickActionLink
              href="/vendor/dashboard/profile"
              label="Storefront profile"
              description="Improve discovery & trust"
              icon={<Store size={18} />}
            />
            <QuickActionLink
              href="/vendor/dashboard/bookings"
              label="Bookings"
              description={`${summary?.confirmedBookings ?? 0} confirmed`}
              icon={<Briefcase size={18} />}
            />
          </div>
        </SectionCard>

        {body}
      </div>
    );
  }

  return body;
}

function WinRateDonut({
  winPct,
  winTotal,
  winRate,
  segments,
}: {
  winPct: number;
  winTotal: number;
  winRate: WinRateSummary;
  segments: { label: string; value: number; color: string }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div
        className="relative h-32 w-32 flex-shrink-0 rounded-full"
        style={{ background: buildWinConic(winRate, winTotal) }}
        role="img"
        aria-label={`Win rate ${winPct} percent`}
      >
        <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-card">
          <span className="text-2xl font-bold tabular-nums text-primary">{winPct}%</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Won
          </span>
        </div>
      </div>
      <ul className="min-w-[8rem] flex-1 space-y-2 text-sm">
        {segments.map((seg) => (
          <li key={seg.label} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className={cn("h-2.5 w-2.5 rounded-full", seg.color)} aria-hidden />
              {seg.label}
            </span>
            <span className="font-semibold tabular-nums text-foreground">{seg.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
