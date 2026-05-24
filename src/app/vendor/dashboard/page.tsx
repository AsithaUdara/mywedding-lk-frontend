"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/shared/context/AuthContext";
import {
  ArrowUpRight,
  CalendarCheck,
  Clock,
  DollarSign,
  Star,
} from "lucide-react";
import { getVendorAnalytics, VendorAnalytics } from "@/shared/lib/api/vendors";
import {
  EmptyState,
  ErrorBanner,
  formatLKR,
  LoadingState,
  PageHeader,
  ProgressBar,
  SectionCard,
  StatCard,
} from "@/modules/vendor/dashboard/ui";

export default function VendorDashboardOverview() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<VendorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;
      try {
        setLoading(true);
        setError(null);
        const token = await user.getIdToken();
        const data = await getVendorAnalytics(token);
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load vendor analytics.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [user]);

  const totals = useMemo(() => {
    if (!analytics) return { bookingsTotal: 1 };
    const bookingsTotal =
      analytics.pendingBookings + analytics.confirmedBookings + analytics.completedBookings || 1;
    return { bookingsTotal };
  }, [analytics]);

  const chartData = analytics?.monthlyEarnings ?? [];
  const chartMax = Math.max(...chartData.map((d) => d.amount), 1);

  if (loading) return <LoadingState label="Loading analytics..." />;

  if (!analytics) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard Overview" description="Business performance snapshot." />
        {error ? <ErrorBanner message={error} /> : null}
        <EmptyState
          title="Analytics unavailable"
          description="Try refreshing this page. If this continues, check your backend connection."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard Overview"
        description="Track bookings, revenue, services, and customer engagement in one place."
        badge={`${analytics.unreadInquiries} unread inquiries`}
      />
      {error ? <ErrorBanner message={error} /> : null}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          index={0}
          label="Total bookings"
          value={analytics.totalBookings}
          sub={`${analytics.pendingBookings} pending`}
          trend={
            analytics.totalBookings > 0
              ? `${analytics.confirmedBookings} confirmed`
              : "No bookings yet"
          }
          trendTone={analytics.totalBookings > 0 ? "success" : "neutral"}
          icon={CalendarCheck}
          iconTheme="primary"
        />
        <StatCard
          index={1}
          label="Pending bookings"
          value={analytics.pendingBookings}
          sub={`${analytics.completedBookings} completed`}
          trend={analytics.pendingBookings > 0 ? "Awaiting action" : "All clear"}
          trendTone={analytics.pendingBookings > 0 ? "attention" : "neutral"}
          icon={Clock}
          iconTheme="amber"
        />
        <StatCard
          index={2}
          label="Total revenue"
          value={formatLKR(analytics.totalRevenue)}
          sub={`${formatLKR(analytics.pendingRevenue)} pending`}
          trend={analytics.totalRevenue > 0 ? "From completed work" : "No revenue yet"}
          trendTone={analytics.totalRevenue > 0 ? "success" : "neutral"}
          icon={DollarSign}
          iconTheme="green"
        />
        <StatCard
          index={3}
          label="Average rating"
          value={analytics.averageRating > 0 ? analytics.averageRating.toFixed(1) : "New"}
          sub={`${analytics.totalReviews} review${analytics.totalReviews === 1 ? "" : "s"}`}
          trend={
            analytics.averageRating >= 4
              ? "Excellent"
              : analytics.averageRating > 0
                ? "Keep improving"
                : "No reviews yet"
          }
          trendTone={
            analytics.averageRating >= 4
              ? "success"
              : analytics.averageRating > 0
                ? "attention"
                : "neutral"
          }
          icon={Star}
          iconTheme="blue"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard
          className="h-full min-h-[250px] lg:col-span-2"
          title="Bookings breakdown"
          subtitle="Status distribution across all booking requests"
          action={
            <Link href="/vendor/dashboard/bookings" className="text-xs font-bold text-primary hover:underline">
              View bookings
            </Link>
          }
        >
          <div className="space-y-4">
            <ProgressBar
              label="Pending"
              count={analytics.pendingBookings}
              total={totals.bookingsTotal}
              color="bg-amber-500"
            />
            <ProgressBar
              label="Confirmed"
              count={analytics.confirmedBookings}
              total={totals.bookingsTotal}
              color="bg-blue-500"
            />
            <ProgressBar
              label="Completed"
              count={analytics.completedBookings}
              total={totals.bookingsTotal}
              color="bg-emerald-500"
            />
          </div>
        </SectionCard>
        <SectionCard
          className="h-full min-h-[250px]"
          title="Services"
          subtitle="Portfolio coverage"
          action={
            <Link
              href="/vendor/dashboard/services"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
              aria-label="Open services"
            >
              <ArrowUpRight size={16} />
            </Link>
          }
        >
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-3xl font-bold text-primary">{analytics.activeServices}</p>
              <p className="text-xs text-slate-500">Active</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-3xl font-bold text-charcoal">{analytics.totalServices}</p>
              <p className="text-xs text-slate-500">Total</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard
          className="h-full min-h-[240px] lg:col-span-2"
          title="Monthly earnings"
          subtitle="Last 6 months from confirmed/completed bookings"
        >
          {chartData.some((d) => d.amount > 0) ? (
            <div className="mt-2 flex h-24 items-end gap-2">
              {chartData.map((item, idx) => (
                <div key={`${item.month}-${idx}`} className="flex flex-1 flex-col items-center gap-1">
                  <motion.div
                    className="w-full rounded-t-md bg-primary/70"
                    style={{ height: `${Math.round((item.amount / chartMax) * 84)}px` }}
                    initial={{ scaleY: 0, originY: 1 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                  />
                  <span className="w-full truncate text-center text-[10px] text-slate-400">
                    {item.month.split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No earnings data yet"
              description="Earnings bars appear once confirmed bookings start coming in."
            />
          )}
        </SectionCard>
        <SectionCard
          className="h-full min-h-[240px]"
          title="Inquiries"
          subtitle="Customer communication"
          action={
            <Link
              href="/vendor/dashboard/inquiries"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
              aria-label="Open inquiries"
            >
              <ArrowUpRight size={16} />
            </Link>
          }
        >
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="rounded-xl bg-rose-50 p-4">
              <p className="text-3xl font-bold text-rose-600">{analytics.unreadInquiries}</p>
              <p className="text-xs text-slate-500">Unread</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-3xl font-bold text-charcoal">{analytics.totalInquiries}</p>
              <p className="text-xs text-slate-500">Total</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
