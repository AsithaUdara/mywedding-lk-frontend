"use client";

import React from "react";
import {
  GlassNavGroup,
  GlassNavItem,
  GlassWorkspaceShell,
} from "@/shared/components/layout/GlassWorkspaceShell";

export type B2BNavItem = GlassNavItem;

export type B2BWorkspaceShellProps = {
  brandName: string;
  brandHref: string;
  brandIcon: React.ReactNode;
  navItems: B2BNavItem[];
  children: React.ReactNode;
  exactMatchHref?: string;
  sidebarFooter?: React.ReactNode;
  topBarActions?: React.ReactNode;
  topBarSearch?: React.ReactNode;
  maxWidthClass?: string;
  onLogout?: () => void | Promise<void>;
};

export function B2BWorkspaceShell({
  brandName,
  brandHref,
  navItems,
  children,
  exactMatchHref,
  sidebarFooter,
  topBarActions,
  maxWidthClass = "max-w-[1500px]",
  onLogout,
}: B2BWorkspaceShellProps) {
  const navGroups: GlassNavGroup[] = [
    {
      label: brandName,
      items: navItems.map((item) =>
        exactMatchHref && item.href === exactMatchHref ? { ...item, exact: true } : item
      ),
    },
  ];

  return (
    <GlassWorkspaceShell
      navGroups={navGroups}
      dashboardHref={brandHref}
      hubSubtitle={`${brandName} console`}
      breadcrumbRoot={brandName}
      searchPlaceholder="Search admin workspace…"
      sidebarFooter={sidebarFooter}
      topBarActions={topBarActions}
      maxWidthClass={maxWidthClass}
      onLogout={onLogout}
    >
      {children}
    </GlassWorkspaceShell>
  );
}
