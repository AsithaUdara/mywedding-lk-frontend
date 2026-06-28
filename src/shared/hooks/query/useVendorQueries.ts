"use client";

import { useAuthedQuery } from "@/shared/hooks/query/useAuthedQuery";
import {
  getVendorAnalytics,
  getVendorAvailability,
  getVendorBillingProfile,
  getVendorBookings,
  getVendorBusinessProfile,
  getVendorDashboardServices,
  getVendorInquiries,
  getVendorInquiryTrend,
  getVendorProfileViews,
  getVendorSubscription,
  getVendorWinRate,
} from "@/shared/lib/api/vendors";
import { queryKeys } from "@/shared/lib/query/queryKeys";

const STALE_MS = 60_000;

export function useVendorBookingsQuery() {
  return useAuthedQuery({
    queryKey: queryKeys.vendor.bookings(),
    queryFn: getVendorBookings,
    staleTime: STALE_MS,
  });
}

export function useVendorServicesQuery() {
  return useAuthedQuery({
    queryKey: queryKeys.vendor.services(),
    queryFn: getVendorDashboardServices,
    staleTime: STALE_MS,
  });
}

export function useVendorBusinessProfileQuery() {
  return useAuthedQuery({
    queryKey: queryKeys.vendor.profile(),
    queryFn: getVendorBusinessProfile,
    staleTime: STALE_MS,
  });
}

export function useVendorSubscriptionQuery() {
  return useAuthedQuery({
    queryKey: queryKeys.vendor.subscription(),
    queryFn: getVendorSubscription,
    staleTime: STALE_MS,
  });
}

export function useVendorBillingProfileQuery() {
  return useAuthedQuery({
    queryKey: queryKeys.vendor.billingProfile(),
    queryFn: getVendorBillingProfile,
    staleTime: STALE_MS,
  });
}

export function useVendorAnalyticsQuery(enabled = true) {
  return useAuthedQuery({
    queryKey: queryKeys.vendor.analytics(),
    queryFn: getVendorAnalytics,
    enabled,
    staleTime: STALE_MS,
  });
}

export function useVendorInquiriesQuery() {
  return useAuthedQuery({
    queryKey: queryKeys.vendor.inquiries(),
    queryFn: getVendorInquiries,
    staleTime: STALE_MS,
  });
}

export function useVendorAvailabilityQuery(month: string) {
  return useAuthedQuery({
    queryKey: queryKeys.vendor.availability(month),
    queryFn: (token) => getVendorAvailability(token, month),
    enabled: !!month,
    staleTime: STALE_MS,
  });
}

export function useVendorProfileViewsQuery(weeks = 6) {
  return useAuthedQuery({
    queryKey: queryKeys.vendor.profileViews(weeks),
    queryFn: (token) => getVendorProfileViews(token, weeks),
    staleTime: STALE_MS,
  });
}

export function useVendorInquiryTrendQuery(months = 6) {
  return useAuthedQuery({
    queryKey: queryKeys.vendor.inquiryTrend(months),
    queryFn: (token) => getVendorInquiryTrend(token, months),
    staleTime: STALE_MS,
  });
}

export function useVendorWinRateQuery() {
  return useAuthedQuery({
    queryKey: queryKeys.vendor.winRate(),
    queryFn: getVendorWinRate,
    staleTime: STALE_MS,
  });
}
