"use client";

import {
  Briefcase,
  CalendarCheck,
  RefreshCw,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useVendorAnalyticsPage } from "@/modules/vendor/dashboard/hooks/useVendorAnalyticsPage";
import {
  BookingFunnelChart,
  BookingStatusChart,
  MonthlyEarningsChart,
} from "@/modules/vendor/dashboard/VendorAnalyticsCharts";
import { VendorServicePerformanceList } from "@/modules/vendor/dashboard/VendorServicePerformanceList";
import { VendorUpcomingBookingsList } from "@/modules/vendor/dashboard/VendorUpcomingBookingsList";
import {
  EmptyState,
  ErrorBanner,
  PageLoadingSkeleton,
  formatLKR,
} from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";
import {
  GlassButton,
  GlassChartCard,
  GlassPageHeader,
  GlassSectionCard,
  GlassStatCard,
} from "./glass-ui";

export function AnalyticsDashboard() {
  const {
    winRate,
    earningsData,
    kpis,
    statusBreakdown,
    servicePerformance,
    upcomingBookings,
    isEmpty,
    showInitialSkeleton,
    refreshing,
    error,
    reload,
  } = useVendorAnalyticsPage();

  if (showInitialSkeleton) {
    return <PageLoadingSkeleton />;
  }
  return (
    <div className="space-y-6 pb-4 md:space-y-8">
      <GlassPageHeader
        title="Business analytics"
        description="Revenue earned, confirmed pipeline, booking workload, and performance by service."
        badge="Revenue & bookings"
        action={
          <GlassButton
            variant="ghost"
            onClick={() => void reload()}
            disabled={refreshing}
            className="gap-1.5"
          >
            <RefreshCw size={16} className={cn(refreshing && "animate-spin")} aria-hidden />
            Refresh
          </GlassButton>
        }
      />

      {error && <ErrorBanner message={error} />}

      {isEmpty ? (
        <EmptyState
          title="No business activity yet"
          description="Publish services and respond to booking requests — earnings and pipeline metrics will show up here."
          icon={TrendingUp}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <GlassButton href="/vendor/dashboard/services" variant="primary">
                Add services
              </GlassButton>
              <GlassButton href="/vendor/dashboard/bookings" variant="ghost">
                View bookings
              </GlassButton>
            </div>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <GlassStatCard
              label="Earned revenue"
              value={formatLKR(kpis.earnedRevenue)}
              sub={
                kpis.earnedRevenue > 0
                  ? `${kpis.completedBookings} completed`
                  : "No completed bookings yet"
              }
              icon={Wallet}
              iconTheme="primary"
            />
            <GlassStatCard
              label="Pipeline value"
              value={formatLKR(kpis.pipelineRevenue)}
              sub={
                kpis.pipelineRevenue > 0
                  ? `${kpis.confirmedBookings} confirmed`
                  : "Nothing confirmed yet"
              }
              icon={Briefcase}
              iconTheme="accent"
            />
            <GlassStatCard
              label="Open bookings"
              value={kpis.openBookings}
              sub={
                kpis.requestedCount > 0
                  ? `${kpis.requestedCount} need accept/decline`
                  : kpis.openBookings > 0
                    ? "Awaiting payment or contract"
                    : "Queue clear"
              }
              icon={CalendarCheck}
              iconTheme={kpis.requestedCount > 0 ? "warning" : "success"}
            />
            <GlassStatCard
              label={kpis.closeRate.label}
              value={kpis.closeRate.value}
              sub={kpis.closeRate.hint}
              icon={TrendingUp}
              iconTheme="success"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-12">
            <GlassChartCard
              label="Revenue trend"
              sublabel="Last 6 months by service date"
              className="lg:col-span-7"
            >
              <MonthlyEarningsChart data={earningsData} />
            </GlassChartCard>

            <GlassChartCard
              label="Booking outcomes"
              sublabel="Won, in progress, and lost"
              className="lg:col-span-5"
            >
              <BookingFunnelChart
                winRate={winRate}
                winPct={kpis.winPct}
                winTotal={kpis.winTotal}
              />
            </GlassChartCard>

            <GlassChartCard
              label="Queue by status"
              sublabel="Where your bookings sit today"
              className="lg:col-span-6"
            >
              <BookingStatusChart slices={statusBreakdown} />
            </GlassChartCard>

            <GlassSectionCard
              title="Top services"
              subtitle="Ranked by booking value"
              className="lg:col-span-6"
            >
              <VendorServicePerformanceList rows={servicePerformance} />
            </GlassSectionCard>
          </div>

          {upcomingBookings.length > 0 && (
            <GlassSectionCard
              title="Upcoming jobs"
              subtitle="Confirmed bookings by service date"
              action={
                <GlassButton href="/vendor/dashboard/bookings" variant="ghost">
                  All bookings
                </GlassButton>
              }
            >
              <VendorUpcomingBookingsList bookings={upcomingBookings} />
            </GlassSectionCard>
          )}
        </>
      )}
    </div>
  );
}
