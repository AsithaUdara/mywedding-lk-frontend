"use client";

import { useMemo } from "react";
import { ArrowRight, RefreshCw, ShieldCheck, ShieldAlert, Users, Wallet } from "lucide-react";
import { VendorApprovalQueue } from "@/modules/admin/VendorApprovalQueue";
import { usePlatformAnalytics } from "@/modules/admin/hooks/usePlatformAnalytics";
import { AdminPlatformKpis } from "@/modules/admin/components/AdminPlatformKpis";
import { AdminGrowthChart } from "@/modules/admin/components/AdminGrowthChart";
import { ErrorBanner, PageLoadingSkeleton } from "@/shared/components/ui";
import {
  GlassButton,
  GlassPageHeader,
  GlassQuickActionLink,
  GlassSectionCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

const QUICK_LINKS = [
  {
    href: "/admin/vendors",
    label: "KYB queue",
    description: "Approve or reject vendor applications",
    icon: <ShieldAlert size={18} aria-hidden />,
  },
  {
    href: "/admin/vendors/directory",
    label: "All vendors",
    description: "Browse every vendor by verification status",
    icon: <Users size={18} aria-hidden />,
  },
  {
    href: "/admin/dashboard/commissions",
    label: "Commission payouts",
    description: "Settle vendor payouts from confirmed bookings",
    icon: <Wallet size={18} aria-hidden />,
  },
  {
    href: "/vendors",
    label: "Public directory",
    description: "Preview couple-facing vendor hub",
    icon: <Users size={18} aria-hidden />,
  },
];

export default function AdminDashboardPage() {
  const { data, loading, refreshing, error, reload } = usePlatformAnalytics();

  const growthMax = useMemo(
    () => Math.max(...(data?.plannerGrowthByMonth.map((p) => p.count) ?? [1]), 1),
    [data]
  );

  if (loading && !data) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-8 pb-4 lg:space-y-10">
      <GlassPageHeader
        title="Operations center"
        description="Platform financial health, planner growth, and vendor trust & safety — live from your admin API."
        badge={
          <span className={cn(rf.badge, "inline-flex items-center gap-1.5")}>
            <ShieldCheck size={12} aria-hidden />
            Internal
          </span>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <GlassButton
              type="button"
              variant="ghost"
              disabled={refreshing}
              onClick={() => void reload()}
              className="gap-1.5"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} aria-hidden />
              Refresh
            </GlassButton>
            <GlassButton href="/admin/vendors" variant="primary" className="gap-1.5">
              <ShieldAlert size={16} aria-hidden />
              KYB queue
            </GlassButton>
          </div>
        }
      />

      {error && <ErrorBanner message={error} />}

      {data && (
        <>
          <AdminPlatformKpis data={data} />

          <div className="grid gap-6 lg:grid-cols-3">
            <GlassSectionCard
              className="lg:col-span-2"
              title="Planner growth"
              subtitle="Active planners — 6 month trend"
              action={
                <span className={cn("text-sm font-semibold tabular-nums", vg.subtitle)}>
                  {data.activePlanners} active
                </span>
              }
            >
              <div className="flex min-h-[280px] flex-col">
                <AdminGrowthChart
                  className="flex-1"
                  points={data.plannerGrowthByMonth}
                  max={growthMax}
                />
                <div
                  className={cn(
                    "mt-4 flex flex-wrap gap-4 border-t border-white/40 pt-4 text-sm",
                    vg.subtitle
                  )}
                >
                <span>
                  <strong className="text-foreground">{data.totalUsers}</strong> users
                </span>
                <span>
                  <strong className="text-foreground">{data.totalEvents}</strong> events
                </span>
                <span>
                  <strong className="text-foreground">{data.totalBookings}</strong> bookings
                </span>
                </div>
              </div>
            </GlassSectionCard>

            <GlassSectionCard title="Quick links" subtitle="Common admin workflows">
              <div className="grid gap-3">
                {QUICK_LINKS.map((item) => (
                  <GlassQuickActionLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    description={item.description}
                    icon={item.icon}
                  />
                ))}
              </div>
            </GlassSectionCard>
          </div>
        </>
      )}

      <GlassSectionCard
        title="Vendor approval queue"
        subtitle="Know-your-business review before marketplace listing"
        action={
          <GlassButton href="/admin/vendors" variant="ghost" className="gap-1">
            Full queue
            <ArrowRight size={14} aria-hidden />
          </GlassButton>
        }
      >
        <VendorApprovalQueue embedded />
      </GlassSectionCard>
    </div>
  );
}
