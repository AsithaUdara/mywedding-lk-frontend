"use client";

import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useVendorAnalyticsQuery,
  useVendorBusinessProfileQuery,
  useVendorInquiriesQuery,
  useVendorProfileViewsQuery,
  useVendorWinRateQuery,
} from "@/shared/hooks/query/useVendorQueries";
import { useVendorPendingBookings } from "@/shared/hooks/useVendorPendingBookings";
import { useVendorVerification } from "@/modules/vendor/dashboard/VendorVerificationContext";
import { queryKeys } from "@/shared/lib/query/queryKeys";
import type { VendorInquiryItem } from "@/shared/lib/api/vendors";

function sortInquiriesForPreview(inquiries: VendorInquiryItem[]): VendorInquiryItem[] {
  return [...inquiries].sort((a, b) => {
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
    return new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime();
  });
}

export function useVendorDashboard() {
  const queryClient = useQueryClient();
  const { data: profile } = useVendorBusinessProfileQuery();
  const {
    data: analytics = null,
    isLoading: analyticsLoading,
    isFetching: analyticsFetching,
    error: analyticsError,
  } = useVendorAnalyticsQuery(true);
  const {
    data: inquiries,
    isLoading: inquiriesLoading,
    isFetching: inquiriesFetching,
  } = useVendorInquiriesQuery();
  const { data: profileViews, isLoading: viewsLoading } = useVendorProfileViewsQuery(6);
  const { data: winRate, isLoading: winLoading } = useVendorWinRateQuery();
  const verification = useVendorVerification();
  const { requestedCount } = useVendorPendingBookings();

  const previewInquiries = useMemo(
    () => sortInquiriesForPreview(inquiries ?? []).slice(0, 3),
    [inquiries]
  );

  const loading =
    (analyticsLoading && analytics === null) ||
    (inquiriesLoading && inquiries === undefined) ||
    (viewsLoading && profileViews === undefined) ||
    (winLoading && winRate === undefined) ||
    verification.loading;
  const refreshing = analyticsFetching || inquiriesFetching;

  const reload = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.vendor.all });
  };

  return {
    profile,
    analytics,
    inquiries: inquiries ?? [],
    previewInquiries,
    profileViews: profileViews ?? [],
    winRate: winRate ?? { won: 0, pending: 0, lost: 0 },
    requestedCount,
    verification,
    loading,
    refreshing,
    error: analyticsError?.message ?? null,
    reload,
  };
}
