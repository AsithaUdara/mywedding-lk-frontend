"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, LogOut, Menu, Search, X } from "lucide-react";
import Logo from "@/assets/MyWedding.png";
import { cn } from "@/shared/lib/cn";
import { useAuth } from "@/shared/context/AuthContext";

const SIDEBAR_EXPANDED = "17rem";
const SIDEBAR_COLLAPSED = "4.75rem";
/** Aligns collapse handle with vertical center of sticky top bar (h-14 / md:h-16) */
const SIDEBAR_TOGGLE_TOP = "top-7 md:top-8";

export type PlannerNavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
};

export type PlannerNavGroup = {
  label: string;
  items: PlannerNavItem[];
};

export type PlannerWorkspaceShellProps = {
  navGroups: PlannerNavGroup[];
  children: React.ReactNode;
  sidebarFooter?: React.ReactNode;
  topBarActions?: React.ReactNode;
};

function isItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PlannerWorkspaceShell({
  navGroups,
  children,
  sidebarFooter,
  topBarActions,
}: PlannerWorkspaceShellProps) {
  const pathname = usePathname();
  const { user, logOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const sidebarWidth = sidebarOpen ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED;

  const flatItems = useMemo(
    () => navGroups.flatMap((g) => g.items),
    [navGroups]
  );

  const activeItem = useMemo(
    () => flatItems.find((item) => isItemActive(pathname, item.href)),
    [pathname, flatItems]
  );

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    document.addEventListener("keydown", onEscape);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  const userInitials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "?";

  const renderNavLink = (item: PlannerNavItem, showLabel: boolean, onNavigate?: () => void) => {
    const isActive = isItemActive(pathname, item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        title={!showLabel ? item.label : undefined}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-primary/10 text-primary shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
        aria-current={isActive ? "page" : undefined}
      >
        {isActive && (
          <span
            className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-full bg-primary"
            aria-hidden
          />
        )}
        <span
          className={cn(
            "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
            isActive
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground group-hover:bg-muted group-hover:text-foreground"
          )}
        >
          {item.icon}
        </span>
        {showLabel && (
          <span className="flex flex-1 items-center justify-between gap-2 truncate">
            <span>{item.label}</span>
            {item.badge != null && item.badge > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                {item.badge > 9 ? "9+" : item.badge}
              </span>
            )}
          </span>
        )}
      </Link>
    );
  };

  const sidebarContent = (showLabels: boolean, onNavigate?: () => void) => (
    <>
      <div className="relative border-b border-border bg-gradient-to-b from-primary/[0.04] to-transparent px-4 py-4">
        <Link
          href="/planner/dashboard"
          className="flex min-w-0 items-center gap-3"
          onClick={onNavigate}
        >
          <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-sm">
            <Image src={Logo} alt="MyWedding.lk" fill sizes="44px" className="object-contain" />
          </div>
          {showLabels && (
            <div className="min-w-0">
              <p className="truncate font-playfair text-base font-bold leading-tight text-foreground">
                MyWedding.lk
              </p>
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                Planner studio
              </p>
            </div>
          )}
        </Link>
      </div>

      <nav className="workspace-shell-nav flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {showLabels && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => renderNavLink(item, showLabels, onNavigate))}
            </div>
          </div>
        ))}
      </nav>

      {showLabels && sidebarFooter}

      <div className="border-t border-workspace-sidebar-border bg-black/[0.02] p-3">
        {showLabels && user && (
          <div className="mb-2 flex items-center gap-3 rounded-2xl border border-workspace-sidebar-border bg-card px-3 py-2.5 shadow-sm">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {user.displayName || "Planner"}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => void logOut()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <LogOut size={18} className="flex-shrink-0" aria-hidden />
          {showLabels && <span>Sign out</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background font-roboto text-foreground">
      <aside
        className={cn(
          "fixed z-40 hidden h-full flex-col bg-workspace-sidebar text-foreground transition-[width] duration-200 ease-out md:flex",
          "border-r border-workspace-sidebar-border shadow-[2px_0_20px_rgba(128,0,32,0.08)]"
        )}
        style={{ width: sidebarWidth }}
      >
        {sidebarContent(sidebarOpen)}
      </aside>

      {/* Edge collapse handle — aligned with top bar / breadcrumb row */}
      <button
        type="button"
        onClick={() => setSidebarOpen((o) => !o)}
        className={cn(
          "fixed z-50 hidden h-9 w-5 -translate-y-1/2 items-center justify-center",
          SIDEBAR_TOGGLE_TOP,
          "rounded-r-md border border-l-0 border-workspace-sidebar-border bg-workspace-sidebar shadow-md",
          "text-muted-foreground transition-all duration-200",
          "hover:border-primary/25 hover:bg-card hover:text-primary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "md:flex"
        )}
        style={{ left: sidebarWidth, transform: "translate(-50%, -50%)" }}
        aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        aria-expanded={sidebarOpen}
      >
        {sidebarOpen ? (
          <ChevronLeft size={14} strokeWidth={2.5} aria-hidden />
        ) : (
          <ChevronRight size={14} strokeWidth={2.5} aria-hidden />
        )}
      </button>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close menu"
          />
          <aside className="absolute left-0 top-0 flex h-full w-[min(100%,18rem)] flex-col border-r border-workspace-sidebar-border bg-workspace-sidebar shadow-xl">
            <div className="flex items-center justify-end border-b border-border p-2">
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close navigation"
              >
                <X size={20} />
              </button>
            </div>
            {sidebarContent(true, () => setMobileNavOpen(false))}
          </aside>
        </div>
      )}

      <div
        className={cn(
          "flex min-w-0 flex-grow flex-col transition-[margin-left] duration-200 ease-out",
          sidebarOpen ? "md:ml-[17rem]" : "md:ml-[4.75rem]"
        )}
      >
        <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-md">
          <div className="flex h-14 items-center justify-between gap-3 px-4 md:h-16 md:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-4">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="rounded-xl p-2 text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
                aria-label="Open navigation"
              >
                <Menu size={20} />
              </button>

              <nav
                aria-label="Breadcrumb"
                className="hidden min-w-0 items-center gap-1 text-xs text-muted-foreground sm:flex"
              >
                <Link href="/planner/dashboard" className="font-medium hover:text-primary">
                  Planner
                </Link>
                <ChevronRight size={12} className="shrink-0 opacity-50" aria-hidden />
                <span className="truncate font-semibold text-foreground">
                  {activeItem?.label ?? "Workspace"}
                </span>
              </nav>

              <p className="truncate text-sm font-semibold text-foreground sm:hidden">
                {activeItem?.label ?? "Planner"}
              </p>
            </div>

            <div className="hidden max-w-md flex-1 md:block lg:max-w-lg">
              <label className="sr-only" htmlFor="planner-workspace-search">
                Search workspace
              </label>
              <div className="relative">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  id="planner-workspace-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search clients, tasks, vendors…"
                  className="w-full rounded-full border border-border bg-muted/40 py-2 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 md:gap-3">{topBarActions}</div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1500px] flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
