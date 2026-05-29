"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useAuth } from "@/shared/context/AuthContext";

export type B2BNavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  /** Optional badge count (e.g. unread inquiries) */
  badge?: number;
};

export type B2BWorkspaceShellProps = {
  brandName: string;
  brandHref: string;
  brandIcon: React.ReactNode;
  navItems: B2BNavItem[];
  children: React.ReactNode;
  /** Exact match only for this href (e.g. vendor dashboard root) */
  exactMatchHref?: string;
  /** Slot below nav — e.g. copilot promo card */
  sidebarFooter?: React.ReactNode;
  /** Top bar right slot — notifications, CTAs */
  topBarActions?: React.ReactNode;
  /** Center search / context (desktop) */
  topBarSearch?: React.ReactNode;
  maxWidthClass?: string;
  onLogout?: () => void;
};

function isItemActive(pathname: string, href: string, exactMatchHref?: string) {
  if (exactMatchHref && href === exactMatchHref) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function B2BWorkspaceShell({
  brandName,
  brandHref,
  brandIcon,
  navItems,
  children,
  exactMatchHref,
  sidebarFooter,
  topBarActions,
  topBarSearch,
  maxWidthClass = "max-w-[1500px]",
  onLogout,
}: B2BWorkspaceShellProps) {
  const pathname = usePathname();
  const { user, logOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = onLogout ?? logOut;

  const activeItem = useMemo(
    () => navItems.find((item) => isItemActive(pathname, item.href, exactMatchHref)),
    [pathname, navItems, exactMatchHref]
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

  const renderNavLink = (item: B2BNavItem, showLabel: boolean, onNavigate?: () => void) => {
    const isActive = isItemActive(pathname, item.href, exactMatchHref);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-sidebar-border text-accent"
            : "text-sidebar-muted hover:bg-sidebar-border/60 hover:text-sidebar-foreground"
        )}
        aria-current={isActive ? "page" : undefined}
      >
        <span
          className={cn(
            "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
            isActive ? "bg-accent/15 text-accent" : "text-sidebar-muted group-hover:text-sidebar-foreground"
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
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <Link
          href={brandHref}
          className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden"
          onClick={onNavigate}
        >
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
            {brandIcon}
          </div>
          {showLabels && (
            <span className="truncate font-playfair text-lg font-bold text-sidebar-foreground">{brandName}</span>
          )}
        </Link>
      </div>
      {showLabels && (
        <p className="px-5 pt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-muted">
          Workspace
        </p>
      )}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {navItems.map((item) => renderNavLink(item, showLabels, onNavigate))}
      </nav>
      {showLabels && sidebarFooter}
      <div className="border-t border-sidebar-border p-3">
        {showLabels && user && (
          <div className="mb-2 flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">
                {user.displayName || "Account"}
              </p>
              <p className="truncate text-xs text-sidebar-muted">{user.email}</p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-muted transition-colors duration-200 hover:bg-destructive/15 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <LogOut size={18} className="flex-shrink-0" aria-hidden />
          {showLabels && <span>Sign out</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background font-roboto text-foreground">
      {/* Desktop sidebar — charcoal */}
      <aside
        className={cn(
          "fixed z-40 hidden h-full flex-col bg-sidebar text-sidebar-foreground transition-all duration-200 md:flex",
          sidebarOpen ? "w-64" : "w-[4.5rem]"
        )}
      >
        {sidebarContent(sidebarOpen)}
      </aside>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/50"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close menu"
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-sidebar shadow-xl">
            <div className="flex items-center justify-end border-b border-sidebar-border p-2">
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-lg p-2 text-sidebar-muted hover:bg-sidebar-border hover:text-sidebar-foreground"
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
          "flex min-w-0 flex-grow flex-col transition-all duration-200",
          sidebarOpen ? "md:ml-64" : "md:ml-[4.5rem]"
        )}
      >
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card/90 px-4 backdrop-blur-md md:h-16 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() =>
                window.innerWidth >= 768 ? setSidebarOpen((o) => !o) : setMobileNavOpen(true)
              }
              className="rounded-lg p-2 text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <Menu size={20} className="md:hidden" />
              <span className="hidden md:inline">
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </span>
            </button>
            <p className="truncate text-sm font-semibold text-foreground md:hidden">
              {activeItem?.label ?? brandName}
            </p>
            {topBarSearch && <div className="hidden md:block">{topBarSearch}</div>}
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {topBarActions}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-semibold text-destructive md:hidden"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className={cn("mx-auto w-full flex-1 p-4 md:p-8", maxWidthClass)}>{children}</main>
      </div>
    </div>
  );
}
