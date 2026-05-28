// src/app/vendor/dashboard/layout.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Package,
  Settings,
  User,
  MessageSquare,
  LogOut,
  Menu,
  ChevronsLeft,
  ChevronsRight,
  X,
  Briefcase,
  Bell,
  Sparkles,
  Crown,
  CalendarDays,
  LineChart,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { getVendorAnalytics, getVendorSubscription } from "@/shared/lib/api/vendors";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const WORKSPACE_BRAND = "Vendor Hub";

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", icon: <BarChart3 size={20} />, href: "/vendor/dashboard" },
  { label: "Analytics", icon: <LineChart size={20} />, href: "/vendor/dashboard/analytics" },
  { label: "Inquiries", icon: <MessageSquare size={20} />, href: "/vendor/dashboard/inquiries" },
  { label: "Availability", icon: <CalendarDays size={20} />, href: "/vendor/dashboard/availability" },
  { label: "My Services", icon: <Package size={20} />, href: "/vendor/dashboard/services" },
  { label: "Bookings", icon: <Briefcase size={20} />, href: "/vendor/dashboard/bookings" },
  { label: "Profile", icon: <User size={20} />, href: "/vendor/dashboard/profile" },
  { label: "Settings", icon: <Settings size={20} />, href: "/vendor/dashboard/settings" },
];

const isNavItemActive = (pathname: string, href: string) => {
  if (href === "/vendor/dashboard") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
};

export default function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();
  const { logOut, user } = useAuth();
  const [unreadInquiries, setUnreadInquiries] = useState(0);
  const [planLabel, setPlanLabel] = useState<"FREE" | "PRO">("FREE");

  const activeItem = useMemo(
    () => NAV_ITEMS.find((item) => isNavItemActive(pathname, item.href)),
    [pathname]
  );

  useEffect(() => {
    const loadUnread = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const [analytics, subscription] = await Promise.all([
          getVendorAnalytics(token),
          getVendorSubscription(token),
        ]);
        setUnreadInquiries(analytics.unreadInquiries ?? 0);
        setPlanLabel(subscription?.tier === "Free" ? "FREE" : "PRO");
      } catch {
        setUnreadInquiries(0);
        setPlanLabel("FREE");
      }
    };
    loadUnread();
  }, [user, pathname]);

  const isListingEditor =
    pathname === "/vendor/dashboard/services/new" ||
    /^\/vendor\/dashboard\/services\/[^/]+\/edit$/.test(pathname);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    document.addEventListener("keydown", onEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileNavOpen]);

  const renderNavItem = (item: NavItem, mobile?: boolean) => {
    const isActive = isNavItemActive(pathname, item.href);
    const showUnread = item.href === "/vendor/dashboard/inquiries" && unreadInquiries > 0;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => mobile && setMobileNavOpen(false)}
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
          isActive
            ? "bg-primary/10 font-semibold text-primary"
            : "text-slate-600 hover:bg-slate-50 hover:text-charcoal"
        }`}
      >
        <div className="flex-shrink-0">{item.icon}</div>
        {(sidebarOpen || mobile) && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{item.label}</span>
            {showUnread && (
              <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                {unreadInquiries}
              </span>
            )}
          </div>
        )}
      </Link>
    );
  };

  if (isListingEditor) {
    return <>{children}</>;
  }

  const userInitials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "V";

  return (
    <div className="flex min-h-screen bg-[#f8f6f3] font-roboto">
      <aside
        className={`fixed z-40 hidden h-full flex-col border-r border-slate-200/80 bg-white shadow-sm transition-all duration-300 md:flex ${
          sidebarOpen ? "w-64" : "w-[4.5rem]"
        }`}
      >
        <div className="relative flex h-20 items-center border-b border-slate-100 px-6">
          <Link href="/" className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Briefcase size={20} strokeWidth={2} />
            </div>
            {sidebarOpen && (
              <span className="whitespace-nowrap font-playfair text-lg font-bold text-charcoal">
                {WORKSPACE_BRAND}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="absolute -right-3 top-1/2 z-50 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition-all hover:border-amber-400 hover:text-amber-700 md:flex"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <ChevronsLeft size={16} /> : <ChevronsRight size={16} />}
          </button>
        </div>

        <nav className="flex-grow space-y-1 overflow-y-auto px-4 py-6">
          {NAV_ITEMS.map((item) => renderNavItem(item))}
        </nav>

        <div className="mt-auto border-t border-slate-100 p-3">
          {sidebarOpen && user && (
            <div className="mb-3 flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-charcoal">
                  {user.displayName || "Vendor account"}
                </p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={logOut}
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-slate-600 transition-all hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Sign out</span>}
          </button>
        </div>

      </aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close menu"
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary p-2 text-white">
                  <Briefcase size={18} />
                </div>
                <p className="font-playfair font-bold">{WORKSPACE_BRAND}</p>
              </div>
              <button className="rounded-lg p-2 hover:bg-slate-100" onClick={() => setMobileNavOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
              {NAV_ITEMS.map((item) => renderNavItem(item, true))}
            </nav>
            <div className="border-t border-slate-100 p-4">
              <button
                onClick={logOut}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-3 text-sm font-semibold text-red-600"
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          </aside>
        </div>
      )}

      <div
        className={`flex min-w-0 flex-grow flex-col transition-all duration-300 ${
          sidebarOpen ? "md:ml-64" : "md:ml-[4.5rem]"
        }`}
      >
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 shadow-sm backdrop-blur-sm md:h-16 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 md:hidden"
              aria-label="Open navigation menu"
              aria-expanded={mobileNavOpen}
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-charcoal">
                {activeItem?.label ?? "Vendor workspace"}
              </p>
              <p className="hidden text-xs text-slate-500 md:block">MyWedding.lk · Vendor Hub</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Link
              href="/vendor/dashboard/settings"
              className="hidden items-center gap-2 rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-xs font-semibold text-amber-900 transition hover:bg-amber-100/90 sm:inline-flex"
            >
              <Sparkles size={14} className="text-amber-700" />
              <span className="hidden lg:inline">Upgrade to Pro</span>
              <span className="lg:hidden">Upgrade</span>
            </Link>
            <Link
              href="/vendor/dashboard/inquiries"
              className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadInquiries > 0 && (
                <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {unreadInquiries > 9 ? "9+" : unreadInquiries}
                </span>
              )}
            </Link>
            <Link
              href="/vendor/dashboard/settings"
              className={`hidden items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all sm:inline-flex ${
                planLabel === "PRO"
                  ? "border-amber-300 bg-amber-50 text-amber-800"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <Crown size={13} className={planLabel === "PRO" ? "text-amber-600" : "text-slate-400"} />
              {planLabel}
            </Link>
            <button
              onClick={logOut}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 md:hidden"
            >
              Log out
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
