"use client";

import { useMemo } from "react";
import { ArrowRight, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import { VendorApprovalQueue } from "@/modules/admin/VendorApprovalQueue";
import { useAdminDashboard } from "@/modules/admin/hooks/useAdminDashboard";
import { buildAdminAttentionItems } from "@/modules/admin/dashboard/adminDashboardHelpers";
import { AdminAttentionPanel } from "@/modules/admin/components/AdminAttentionPanel";
import { AdminPlatformKpis } from "@/modules/admin/components/AdminPlatformKpis";
import { AdminGrowthChart } from "@/modules/admin/components/AdminGrowthChart";
import { ErrorBanner, PageLoadingSkeleton } from "@/shared/components/ui";
import {
  GlassButton,
  GlassPageHeader,
  GlassSectionCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

export default function AdminDashboardPage() {
  const {
    analytics,
    pendingVendors,
    payoutSummary,
    loading,
    refreshing,
    error,
    reload,
  } = useAdminDashboard();

  const attentionItems = useMemo(
    () => buildAdminAttentionItems(pendingVendors, payoutSummary),
    [pendingVendors, payoutSummary]
  );

  const growthMax = useMemo(
    () => Math.max(...(analytics?.plannerGrowthByMonth.map((p) => p.count) ?? [1]), 1),
    [analytics]
  );

  const primaryAction = attentionItems[0];

  if (loading && !analytics) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-8 pb-4 lg:space-y-10">
      <GlassPageHeader
        title="Overview"
        description="Financial health, operational queues, and planner growth — everything that needs your attention in one place."
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
            {primaryAction ? (
              <GlassButton href={primaryAction.href} variant="primary" className="gap-1.5">
                <ShieldAlert size={16} aria-hidden />
                {primaryAction.title}
              </GlassButton>
            ) : null}
          </div>
        }
      />

      {error && <ErrorBanner message={error} />}

      <AdminAttentionPanel items={attentionItems} />

      {analytics && (
        <>
          <AdminPlatformKpis
            data={analytics}
            pendingVendors={pendingVendors}
            payoutSummary={payoutSummary}
          />

          <GlassSectionCard
            title="Planner growth"
            subtitle="Active planners over the last 6 months"
            action={
              <span className={cn("text-sm font-semibold tabular-nums", vg.subtitle)}>
                {analytics.activePlanners} active now
              </span>
            }
          >
            <AdminGrowthChart
              className="min-h-[260px]"
              points={analytics.plannerGrowthByMonth}
              max={growthMax}
            />
          </GlassSectionCard>
        </>
      )}

      {pendingVendors.length > 0 && (
        <GlassSectionCard
          title="KYB preview"
          subtitle="Review the oldest pending applications — full queue on KYB page"
          action={
            <GlassButton href="/admin/vendors" variant="ghost" className="gap-1">
              Full queue
              <ArrowRight size={14} aria-hidden />
            </GlassButton>
          }
        >
          <VendorApprovalQueue embedded />
        </GlassSectionCard>
      )}
    </div>
  );
}
