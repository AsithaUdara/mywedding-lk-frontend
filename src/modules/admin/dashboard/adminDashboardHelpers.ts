import type { PendingVendor, PayoutDueItem, PlatformAnalytics } from "@/shared/lib/api/admin";
import { formatLKR } from "@/shared/components/ui";

export type AdminAttentionItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  priority: "high" | "medium";
};

export function buildAdminAttentionItems(
  pendingVendors: PendingVendor[],
  payoutsDue: PayoutDueItem[]
): AdminAttentionItem[] {
  const items: AdminAttentionItem[] = [];

  if (pendingVendors.length > 0) {
    const preview = pendingVendors
      .slice(0, 2)
      .map((v) => v.businessName)
      .join(", ");
    const suffix = pendingVendors.length > 2 ? "…" : "";
    items.push({
      id: "kyb-pending",
      title: `${pendingVendors.length} vendor${pendingVendors.length === 1 ? "" : "s"} awaiting KYB`,
      description: `${preview}${suffix} — verify before marketplace listing`,
      href: "/admin/vendors",
      priority: "high",
    });
  }

  if (payoutsDue.length > 0) {
    const totalCommission = payoutsDue.reduce((sum, row) => sum + row.commissionAmount, 0);
    items.push({
      id: "payouts-due",
      title: `${payoutsDue.length} unsettled vendor payout${payoutsDue.length === 1 ? "" : "s"}`,
      description: `${formatLKR(totalCommission)} platform commission ready to settle`,
      href: "/admin/dashboard/commissions",
      priority: "high",
    });
  }

  return items;
}

export function adminPlatformVolume(data: PlatformAnalytics) {
  return {
    bookings: data.totalBookings,
    events: data.totalEvents,
    vendors: data.registeredVendors,
    planners: data.activePlanners,
    conversionPct:
      data.totalEvents > 0
        ? Math.round((data.eventsWithBookings / data.totalEvents) * 100)
        : 0,
  };
}
