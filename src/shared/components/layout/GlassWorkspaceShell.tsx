"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, LogOut, Menu, Search, X } from "lucide-react";
import Logo from "@/assets/MyWedding.png";
import { cn } from "@/shared/lib/cn";
import { useAuth } from "@/shared/context/AuthContext";
import { glassFontVariables } from "@/modules/design-system/regal-frost/fonts";

const SIDEBAR_EXPANDED = "17rem";
const SIDEBAR_COLLAPSED = "4.75rem";

export type GlassNavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  exact?: boolean;
};

export type GlassNavGroup = {
  label: string;
  items: GlassNavItem[];
};

export type GlassWorkspaceShellProps = {
  navGroups: GlassNavGroup[];
  children: React.ReactNode;
  dashboardHref: string;
  hubSubtitle: string;
  breadcrumbRoot: string;
  searchPlaceholder?: string;
  sidebarFooter?: React.ReactNode;
  topBarActions?: React.ReactNode;
  maxWidthClass?: string;
  onLogout?: () => void | Promise<void>;
  /** White-label studio branding (Planner Pro). Falls back to platform logo when omitted. */
  workspaceBrand?: {
    logoUrl?: string | null;
    title: string;
    subtitle?: string;
  } | null;
};

function isItemActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function GlassWorkspaceShell({
  navGroups,
  children,
  dashboardHref,
  hubSubtitle,
  breadcrumbRoot,
  searchPlaceholder = "Search workspace…",
  sidebarFooter,
  topBarActions,
  maxWidthClass,
  onLogout,
  workspaceBrand,
}: GlassWorkspaceShellProps) {
  const pathname = usePathname();
  const { user, logOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const sidebarWidth = sidebarOpen ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED;
  const flatItems = useMemo(() => navGroups.flatMap((g) => g.items), [navGroups]);
  const activeItem = useMemo(
    () => flatItems.find((item) => isItemActive(pathname, item.href, item.exact)),
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

  const handleLogout = onLogout ?? logOut;

  const useStudioBrand = Boolean(workspaceBrand);
  const brandTitle = useStudioBrand ? workspaceBrand!.title : "MyWedding.lk";
  const brandSubtitle = useStudioBrand
    ? workspaceBrand?.subtitle ?? hubSubtitle
    : hubSubtitle;
  const brandLogoUrl = workspaceBrand?.logoUrl;

  const userInitials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "?";

  const renderNavLink = (item: GlassNavItem, showLabel: boolean, onNavigate?: () => void) => {
    const isActive = isItemActive(pathname, item.href, item.exact);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        title={!showLabel ? item.label : undefined}
        className={cn(
          "group relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-200",
          isActive ? "vgo-nav-active" : "vgo-nav-idle"
        )}
        aria-current={isActive ? "page" : undefined}
      >
        <span className="vgo-nav-icon flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors duration-200">
          {item.icon}
        </span>
        {showLabel && (
          <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
            <span className="truncate leading-none">{item.label}</span>
            {item.badge != null && item.badge > 0 && (
              <span className="flex-shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
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
      <div className="vgo-sidebar-brand relative flex-shrink-0 border-b px-4 py-4">
        <Link
          href={dashboardHref}
          className="flex min-w-0 items-center gap-3"
          onClick={onNavigate}
        >
          <div className="vgo-glass-subtle relative flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/60 p-1.5">
            {brandLogoUrl ? (
              <Image
                src={brandLogoUrl}
                alt={`${brandTitle} logo`}
                fill
                sizes="44px"
                className="object-contain"
                unoptimized
              />
            ) : useStudioBrand ? (
              <span className="text-sm font-bold text-primary" aria-hidden>
                {brandTitle.slice(0, 2).toUpperCase()}
              </span>
            ) : (
              <Image src={Logo} alt="MyWedding.lk" fill sizes="44px" className="object-contain" />
            )}
          </div>
          {showLabels && (
            <div className="min-w-0">
              <p className="truncate font-glass-body text-base font-semibold leading-tight text-foreground">
                {brandTitle}
              </p>
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                {brandSubtitle}
              </p>
              {useStudioBrand && (
                <p className="mt-0.5 truncate text-[9px] font-medium text-muted-foreground">
                  Powered by MyWedding.lk
                </p>
              )}
            </div>
          )}
        </Link>
      </div>

      <nav className="vgo-sidebar-nav workspace-shell-nav space-y-5 px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {showLabels && <p className="vgo-sidebar-group-label mb-2 px-3">{group.label}</p>}
            <div className="space-y-1">
              {group.items.map((item) => renderNavLink(item, showLabels, onNavigate))}
            </div>
          </div>
        ))}
      </nav>

      {showLabels && sidebarFooter && (
        <div className="relative z-[2] flex-shrink-0">{sidebarFooter}</div>
      )}

      <div className="vgo-sidebar-footer relative z-[2] flex-shrink-0 border-t p-3">
        {showLabels && user && (
          <div className="vgo-user-card mb-2 flex items-center gap-3 rounded-xl border px-3 py-2.5">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {user.displayName || "User"}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <LogOut size={18} className="flex-shrink-0" aria-hidden />
          {showLabels && <span>Sign out</span>}
        </button>
      </div>
    </>
  );

  return (
    <div
      className={cn(
        "regal-frost-shell vendor-glass-overview vgo-flex-shell relative flex min-h-screen font-glass-body text-foreground",
        glassFontVariables
      )}
    >
      <div className="vgo-mesh-orb vgo-mesh-orb--gold" aria-hidden />
      <div className="vgo-mesh-orb vgo-mesh-orb--maroon" aria-hidden />
      <div className="vgo-mesh-orb vgo-mesh-orb--slate" aria-hidden />

      <aside
        className="vgo-sidebar z-40 hidden flex-col transition-[width] duration-200 ease-out md:flex"
        style={{ width: sidebarWidth }}
      >
        {sidebarContent(sidebarOpen)}
      </aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close menu"
          />
          <aside className="vgo-sidebar absolute left-0 top-0 flex h-full w-[min(100%,18rem)] flex-col border-r shadow-xl">
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

      <div className="vgo-canvas flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 overflow-visible px-5 pt-3 md:px-8 md:pt-4">
          <div className="vgo-topbar relative flex h-14 items-center justify-between gap-3 overflow-visible rounded-2xl px-4 md:h-[3.75rem] md:px-6">
            <button
              type="button"
              onClick={() => setSidebarOpen((o) => !o)}
              className="vgo-sidebar-toggle absolute top-1/2 z-50 hidden h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
              style={{ left: "-2rem" }}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? (
                <ChevronLeft size={14} strokeWidth={2.5} aria-hidden />
              ) : (
                <ChevronRight size={14} strokeWidth={2.5} aria-hidden />
              )}
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-4">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="vgo-topbar-btn rounded-xl p-2 text-muted-foreground transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
                aria-label="Open navigation"
              >
                <Menu size={20} />
              </button>

              <nav
                aria-label="Breadcrumb"
                className="hidden min-w-0 items-center gap-1 text-xs text-muted-foreground sm:flex"
              >
                <Link href={dashboardHref} className="font-medium hover:text-primary">
                  {breadcrumbRoot}
                </Link>
                <ChevronRight size={12} className="shrink-0 opacity-50" aria-hidden />
                <span className="truncate font-semibold text-foreground">
                  {activeItem?.label ?? "Workspace"}
                </span>
              </nav>

              <p className="truncate text-sm font-semibold text-foreground sm:hidden">
                {activeItem?.label ?? breadcrumbRoot}
              </p>
            </div>

            <div className="hidden max-w-md flex-1 md:block lg:max-w-lg">
              <label className="sr-only" htmlFor="glass-workspace-search">
                Search workspace
              </label>
              <div className="relative">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  id="glass-workspace-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="vgo-search w-full rounded-full border py-2 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 md:gap-3">{topBarActions}</div>
          </div>
        </header>

        <main
          className={cn(
            "dashboard-workspace-ui relative z-10 w-full flex-1 px-5 py-6 md:px-8 md:py-8",
            maxWidthClass && `mx-auto w-full ${maxWidthClass}`
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
