"use client";

import Link from "next/link";
import {
  BarChart3,
  Briefcase,
  CalendarDays,
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
import { RegalFrostShell } from "@/modules/design-system/regal-frost/RegalFrostShell";
import { getVendorAnalytics, getVendorSubscription } from "@/shared/lib/api/vendors";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { VendorVerificationProvider } from "@/modules/vendor/dashboard/VendorVerificationContext";
import { VendorVerificationBanner } from "@/modules/vendor/dashboard/VendorVerificationBanner";
import { VendorBookingActionBanner } from "@/modules/vendor/dashboard/VendorBookingActionBanner";
import { WorkspacePlanBadge } from "@/shared/components/layout/WorkspacePlanBadge";
import { useVendorPendingBookings } from "@/shared/hooks/useVendorPendingBookings";

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
  const { requestedCount, loading: pendingBookingsLoading } = useVendorPendingBookings();

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

  const notificationCount = unreadInquiries + requestedCount;
  const notificationHref =
    requestedCount > 0 ? "/vendor/dashboard/bookings" : "/vendor/dashboard/inquiries";

  if (isListingEditor) {
    return (
      <VendorVerificationProvider>
        <RegalFrostShell mesh className="!flex-col">
          <VendorVerificationBanner compact />
          {children}
        </RegalFrostShell>
      </VendorVerificationProvider>
    );
  }

  const navGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.map((item) => {
      if (item.href === "/vendor/dashboard/inquiries") {
        return { ...item, badge: unreadInquiries };
      }
      if (item.href === "/vendor/dashboard/bookings") {
        return { ...item, badge: requestedCount };
      }
      return item;
    }),
  }));

  return (
    <VendorVerificationProvider>
    <VendorWorkspaceShell
      navGroups={navGroups}
      sidebarFooter={
        <div className="vgo-pro-card mx-3 mb-2 rounded-xl border p-3.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Growth
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">Vendor Pro</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            More visibility and priority placement in search.
          </p>
          <Link
            href="/vendor/dashboard/settings"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            View plans
            <Sparkles size={12} aria-hidden />
          </Link>
        </div>
      }
      topBarActions={
        <>
          <Button
            href="/vendor/dashboard/settings"
            variant="ghost"
            size="sm"
            className="vgo-upgrade-btn hidden rounded-xl sm:inline-flex"
          >
            <Sparkles size={14} aria-hidden />
            Upgrade
          </Button>
          <Link
            href={notificationHref}
            className="vgo-topbar-btn relative rounded-xl border p-2 text-muted-foreground transition-all duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={
              requestedCount > 0
                ? `${requestedCount} booking request${requestedCount === 1 ? "" : "s"}`
                : "Inquiries"
            }
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </Link>
          <WorkspacePlanBadge
            tier={planLabel}
            href="/vendor/dashboard/settings"
            title="Subscription & settings"
          />
        </>
      }
    >
      <VendorVerificationBanner />
      <VendorBookingActionBanner
        requestedCount={requestedCount}
        loading={pendingBookingsLoading}
      />
      {children}
    </VendorWorkspaceShell>
    </VendorVerificationProvider>
  );
}
