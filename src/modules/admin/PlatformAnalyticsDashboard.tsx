"use client";

/**
 * @deprecated Prefer `usePlatformAnalytics` + `AdminPlatformKpis` on the dashboard page.
 * Kept for backwards compatibility if imported elsewhere.
 */
import { useMemo } from "react";
import { usePlatformAnalytics } from "@/modules/admin/hooks/usePlatformAnalytics";
import { AdminPlatformKpis } from "@/modules/admin/components/AdminPlatformKpis";
import { AdminGrowthChart } from "@/modules/admin/components/AdminGrowthChart";
import { SectionCard, ErrorBanner, PageLoadingSkeleton } from "@/shared/components/ui";

export function PlatformAnalyticsDashboard({ compact = false }: { compact?: boolean }) {
  const { data, loading, error } = usePlatformAnalytics();
  const growthMax = useMemo(
    () => Math.max(...(data?.plannerGrowthByMonth.map((p) => p.count) ?? [1]), 1),
    [data]
  );

  if (loading && !data) {
    return <PageLoadingSkeleton />;
  }

  if (!data) {
    return <ErrorBanner message={error ?? "No analytics data."} />;
  }

  if (compact) {
    return (
      <div className="space-y-6">
        <AdminPlatformKpis data={data} />
        <AdminGrowthChart points={data.plannerGrowthByMonth} max={growthMax} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPlatformKpis data={data} />
      <SectionCard title="Planner growth" subtitle="Active planners — 6 month trend">
        <AdminGrowthChart points={data.plannerGrowthByMonth} max={growthMax} />
      </SectionCard>
    </div>
  );
}
