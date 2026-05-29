"use client";

import Link from "next/link";
import {
  BarChart3,
  Briefcase,
  CalendarDays,
  Crown,
  LineChart,
  MessageSquare,
  Package,
  Settings,
  Sparkles,
  User,
  Bell,
} from "lucide-react";
import {
  VendorNavGroup,
  VendorWorkspaceShell,
} from "@/shared/components/layout/VendorWorkspaceShell";
import { Button } from "@/shared/components/ui";
import { useAuth } from "@/shared/context/AuthContext";
import { getVendorAnalytics, getVendorSubscription } from "@/shared/lib/api/vendors";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const NAV_GROUPS: VendorNavGroup[] = [
  {
    label: "Workspace",
    items: [
      { label: "Overview", icon: <BarChart3 size={18} />, href: "/vendor/dashboard", exact: true },
      { label: "Analytics", icon: <LineChart size={18} />, href: "/vendor/dashboard/analytics" },
    ],
  },
  {
    label: "Storefront",
    items: [
      { label: "Inquiries", icon: <MessageSquare size={18} />, href: "/vendor/dashboard/inquiries" },
      { label: "Availability", icon: <CalendarDays size={18} />, href: "/vendor/dashboard/availability" },
      { label: "My services", icon: <Package size={18} />, href: "/vendor/dashboard/services" },
      { label: "Bookings", icon: <Briefcase size={18} />, href: "/vendor/dashboard/bookings" },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Profile", icon: <User size={18} />, href: "/vendor/dashboard/profile" },
      { label: "Settings", icon: <Settings size={18} />, href: "/vendor/dashboard/settings" },
    ],
  },
];

export default function VendorDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [unreadInquiries, setUnreadInquiries] = useState(0);
  const [planLabel, setPlanLabel] = useState<"FREE" | "PRO">("FREE");

  const isListingEditor =
    pathname === "/vendor/dashboard/services/new" ||
    /^\/vendor\/dashboard\/services\/[^/]+\/edit$/.test(pathname);

  useEffect(() => {
    const load = async () => {
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
    void load();
  }, [user, pathname]);

  if (isListingEditor) {
    return <>{children}</>;
  }

  const navGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.map((item) =>
      item.href === "/vendor/dashboard/inquiries"
        ? { ...item, badge: unreadInquiries }
        : item
    ),
  }));

  return (
    <VendorWorkspaceShell
      navGroups={navGroups}
      sidebarFooter={
        <div className="mx-3 mb-3 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/8 via-card to-accent/10 p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
            Growth
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">Vendor Pro</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            More visibility and priority placement in search.
          </p>
          <Link
            href="/vendor/dashboard/settings"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity duration-200 hover:opacity-90"
          >
            View plans
            <Sparkles size={12} aria-hidden />
          </Link>
        </div>
      }
      topBarActions={
        <>
          <Button href="/vendor/dashboard/settings" variant="accent" size="sm" className="hidden sm:inline-flex">
            <Sparkles size={14} aria-hidden />
            Upgrade
          </Button>
          <Link
            href="/vendor/dashboard/inquiries"
            className="relative rounded-full border border-border bg-card p-2 text-muted-foreground transition-colors duration-200 hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Inquiries"
          >
            <Bell size={20} />
            {unreadInquiries > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {unreadInquiries > 9 ? "9+" : unreadInquiries}
              </span>
            )}
          </Link>
          <span
            className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-semibold sm:inline-flex ${
              planLabel === "PRO"
                ? "border-accent/40 bg-accent/15 text-accent-foreground"
                : "border-border bg-muted text-muted-foreground"
            }`}
          >
            <Crown size={13} aria-hidden />
            {planLabel}
          </span>
        </>
      }
    >
      {children}
    </VendorWorkspaceShell>
  );
}
