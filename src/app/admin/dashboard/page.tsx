"use client";

import { useMemo } from "react";
import { ArrowRight, RefreshCw, ShieldCheck, ShieldAlert, Users, Wallet } from "lucide-react";
import { VendorApprovalQueue } from "@/modules/admin/VendorApprovalQueue";
import { usePlatformAnalytics } from "@/modules/admin/hooks/usePlatformAnalytics";
import { AdminPlatformKpis } from "@/modules/admin/components/AdminPlatformKpis";
import { AdminGrowthChart } from "@/modules/admin/components/AdminGrowthChart";
import { AdminEcosystemSnapshot } from "@/modules/admin/components/AdminEcosystemSnapshot";
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
              <AdminGrowthChart points={data.plannerGrowthByMonth} max={growthMax} />
              <div
                className={cn(
                  "mt-6 flex flex-wrap gap-4 border-t border-white/40 pt-4 text-sm",
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
            </GlassSectionCard>

            <GlassSectionCard title="Ecosystem snapshot" subtitle="Platform scale at a glance">
              <AdminEcosystemSnapshot data={data} />
            </GlassSectionCard>
          </div>

          <GlassSectionCard title="Quick links" subtitle="Common admin workflows">
            <div className="grid gap-3 sm:grid-cols-2">
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

      <div
        className={cn(
          rf.panel,
          "border-primary/25 bg-gradient-to-br from-primary via-primary to-primary/90 p-6 text-primary-foreground sm:p-8"
        )}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground/70">
              Platform integrity
            </p>
            <h3 className="mt-2 font-luxury-display text-2xl font-normal tracking-[0.04em]">
              Keep the marketplace trustworthy
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-primary-foreground/85">
              Verified vendors protect couples and planners. Review credentials, portfolio links, and
              business details before approval.
            </p>
          </div>
          <GlassButton
            href="/admin/vendors"
            variant="ghost"
            className="shrink-0 border-0 bg-white/90 text-primary hover:bg-white"
          >
            Review applications
            <ArrowRight size={16} aria-hidden />
          </GlassButton>
        </div>
      </div>
    </div>
  );
}
