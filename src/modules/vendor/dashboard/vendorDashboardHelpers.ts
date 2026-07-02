import type { VendorAnalytics } from "@/shared/lib/api/vendors";

export type VendorAttentionItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  priority: "high" | "medium";
};

type BuildVendorAttentionParams = {
  requestedBookings: number;
  unreadInquiries: number;
  isVerified: boolean;
  isPending: boolean;
  isRejected: boolean;
  activeServices: number;
};

export function buildVendorAttentionItems({
  requestedBookings,
  unreadInquiries,
  isVerified,
  isPending,
  isRejected,
  activeServices,
}: BuildVendorAttentionParams): VendorAttentionItem[] {
  const items: VendorAttentionItem[] = [];

  if (requestedBookings > 0) {
    items.push({
      id: "booking-requests",
      title: `${requestedBookings} booking request${requestedBookings === 1 ? "" : "s"}`,
      description: "Couples are waiting for your accept or decline",
      href: "/vendor/dashboard/bookings",
      priority: "high",
    });
  }

  if (unreadInquiries > 0) {
    items.push({
      id: "unread-inquiries",
      title: `${unreadInquiries} unread inquir${unreadInquiries === 1 ? "y" : "ies"}`,
      description: "Reply or send a quote from your inbox",
      href: "/vendor/dashboard/inquiries",
      priority: "high",
    });
  }

  if (isRejected) {
    items.push({
      id: "verification-rejected",
      title: "Verification needs attention",
      description: "Update your business profile and contact support if needed",
      href: "/vendor/dashboard/profile",
      priority: "high",
    });
  } else if (isPending) {
    items.push({
      id: "verification-pending",
      title: "Storefront under review",
      description: "Finish your profile and draft services while KYB is processed",
      href: "/vendor/dashboard/profile",
      priority: "medium",
    });
  }

  if (isVerified && activeServices === 0) {
    items.push({
      id: "no-listings",
      title: "No live services",
      description: "Publish at least one service to appear in marketplace search",
      href: "/vendor/dashboard/services",
      priority: "medium",
    });
  }

  return items;
}

export function countVendorNeedsAttention(items: VendorAttentionItem[]): number {
  return items.filter((item) => item.priority === "high").length;
}

export function vendorWinRatePct(winRate: { won: number; pending: number; lost: number }): number {
  const total = winRate.won + winRate.pending + winRate.lost;
  if (total <= 0) return 0;
  return Math.round((winRate.won / total) * 100);
}

export function vendorThisWeekViews(
  profileViews: Array<{ week: string; views: number }>
): number {
  if (profileViews.length === 0) return 0;
  return profileViews[profileViews.length - 1]?.views ?? 0;
}

export function vendorStorefrontSummary(analytics: VendorAnalytics | null) {
  return {
    activeServices: analytics?.activeServices ?? 0,
    confirmedBookings: analytics?.confirmedBookings ?? 0,
    totalRevenue: analytics?.totalRevenue ?? 0,
    unreadInquiries: analytics?.unreadInquiries ?? 0,
    averageRating: analytics?.averageRating ?? 0,
    totalReviews: analytics?.totalReviews ?? 0,
  };
}
