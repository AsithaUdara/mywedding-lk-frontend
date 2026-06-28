"use client";

/**
 * @deprecated Prefer `useAdminDashboard` on `/admin/dashboard`.
 */
import { useMemo } from "react";
import { useAdminDashboard } from "@/modules/admin/hooks/useAdminDashboard";
import { AdminPlatformKpis } from "@/modules/admin/components/AdminPlatformKpis";
import { AdminGrowthChart } from "@/modules/admin/components/AdminGrowthChart";
import { SectionCard, ErrorBanner, PageLoadingSkeleton } from "@/shared/components/ui";

export function PlatformAnalyticsDashboard({ compact = false }: { compact?: boolean }) {
  const { analytics, pendingVendors, payoutSummary, loading, error } = useAdminDashboard();
  const growthMax = useMemo(
    () => Math.max(...(analytics?.plannerGrowthByMonth.map((p) => p.count) ?? [1]), 1),
    [analytics]
  );

  if (loading && !analytics) {
    return <PageLoadingSkeleton />;
  }

  if (!analytics) {
    return <ErrorBanner message={error ?? "No analytics data."} />;
  }

  if (compact) {
    return (
      <div className="space-y-6">
        <AdminPlatformKpis
          data={analytics}
          pendingVendors={pendingVendors}
          payoutSummary={payoutSummary}
        />
        <AdminGrowthChart points={analytics.plannerGrowthByMonth} max={growthMax} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPlatformKpis
        data={analytics}
        pendingVendors={pendingVendors}
        payoutSummary={payoutSummary}
      />
      <SectionCard title="Planner growth" subtitle="Active planners — 6 month trend">
        <AdminGrowthChart points={analytics.plannerGrowthByMonth} max={growthMax} />
      </SectionCard>
    </div>
  );
}
