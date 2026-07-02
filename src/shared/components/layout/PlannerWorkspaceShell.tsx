"use client";

import React from "react";
import {
  GlassNavGroup,
  GlassWorkspaceShell,
} from "@/shared/components/layout/GlassWorkspaceShell";
import { usePlannerBranding } from "@/modules/planner/branding/PlannerBrandingProvider";

export type PlannerNavItem = GlassNavGroup["items"][number];
export type PlannerNavGroup = GlassNavGroup;

export type PlannerWorkspaceShellProps = {
  navGroups: PlannerNavGroup[];
  children: React.ReactNode;
  sidebarFooter?: React.ReactNode;
  topBarActions?: React.ReactNode;
};

export function PlannerWorkspaceShell({
  navGroups,
  children,
  sidebarFooter,
  topBarActions,
}: PlannerWorkspaceShellProps) {
  const { brand } = usePlannerBranding();

  const workspaceBrand = brand?.isPro
    ? {
        logoUrl: brand.agencyLogoUrl,
        title: brand.businessName,
        subtitle: "Planner workspace",
      }
    : null;

  return (
    <GlassWorkspaceShell
      navGroups={navGroups}
      dashboardHref="/planner/dashboard"
      hubSubtitle="Planner workspace"
      breadcrumbRoot="Planner"
      searchPlaceholder="Search clients, tasks, vendors…"
      sidebarFooter={sidebarFooter}
      topBarActions={topBarActions}
      maxWidthClass="max-w-7xl"
      workspaceBrand={workspaceBrand}
    >
      <div className="dashboard-workspace-ui planner-workspace-ui">{children}</div>
    </GlassWorkspaceShell>
  );
}
