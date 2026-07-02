"use client";

import React from "react";
import {
  GlassNavGroup,
  GlassWorkspaceShell,
} from "@/shared/components/layout/GlassWorkspaceShell";

export type VendorNavItem = GlassNavGroup["items"][number];
export type VendorNavGroup = GlassNavGroup;

export type VendorWorkspaceShellProps = {
  navGroups: VendorNavGroup[];
  children: React.ReactNode;
  sidebarFooter?: React.ReactNode;
  topBarActions?: React.ReactNode;
  maxWidthClass?: string;
};

export function VendorWorkspaceShell({
  navGroups,
  children,
  sidebarFooter,
  topBarActions,
  maxWidthClass = "max-w-7xl",
}: VendorWorkspaceShellProps) {
  return (
    <GlassWorkspaceShell
      navGroups={navGroups}
      dashboardHref="/vendor/dashboard"
      hubSubtitle="Vendor hub"
      breadcrumbRoot="Vendor"
      searchPlaceholder="Search inquiries, services, bookings…"
      sidebarFooter={sidebarFooter}
      topBarActions={topBarActions}
      maxWidthClass={maxWidthClass}
    >
      {children}
    </GlassWorkspaceShell>
  );
}
