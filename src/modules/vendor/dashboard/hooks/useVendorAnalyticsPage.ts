"use client";

import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useVendorAnalyticsQuery,
  useVendorBookingsQuery,
  useVendorWinRateQuery,
} from "@/shared/hooks/query/useVendorQueries";
import { queryKeys } from "@/shared/lib/query/queryKeys";
import {
  buildBookingStatusBreakdown,
  buildServicePerformance,
  buildUpcomingBookings,
  isVendorBusinessAnalyticsEmpty,
  parseVendorEarnings,
  vendorBusinessKpis,
} from "@/modules/vendor/dashboard/vendorAnalyticsHelpers";

export function useVendorAnalyticsPage() {
  const queryClient = useQueryClient();

  const {
    data: summary = null,
    isLoading: summaryLoading,
    isFetching: summaryFetching,
    error: summaryError,
  } = useVendorAnalyticsQuery(true);
  const {
    data: bookings,
    isLoading: bookingsLoading,
    isFetching: bookingsFetching,
    error: bookingsError,
  } = useVendorBookingsQuery();
  const {
    data: winRate,
    isLoading: winLoading,
    isFetching: winFetching,
    error: winError,
  } = useVendorWinRateQuery();

  const resolvedBookings = bookings ?? [];
  const resolvedWinRate = winRate ?? { won: 0, pending: 0, lost: 0 };

  const loading =
    (summaryLoading && summary === null) ||
    (bookingsLoading && bookings === undefined) ||
    (winLoading && winRate === undefined);
  const refreshing = summaryFetching || bookingsFetching || winFetching;

  const error = useMemo(() => {
    const err = summaryError ?? bookingsError ?? winError;
    return err?.message ?? null;
  }, [summaryError, bookingsError, winError]);

  const earningsData = useMemo(() => parseVendorEarnings(summary), [summary]);
  const kpis = useMemo(
    () => vendorBusinessKpis({ summary, bookings: resolvedBookings, winRate: resolvedWinRate }),
    [summary, resolvedBookings, resolvedWinRate]
  );
  const statusBreakdown = useMemo(() => buildBookingStatusBreakdown(resolvedBookings), [resolvedBookings]);
  const servicePerformance = useMemo(() => buildServicePerformance(resolvedBookings), [resolvedBookings]);
  const upcomingBookings = useMemo(() => buildUpcomingBookings(resolvedBookings), [resolvedBookings]);
  const isEmpty = useMemo(
    () => isVendorBusinessAnalyticsEmpty({ summary, bookings: resolvedBookings, winRate: resolvedWinRate }),
    [summary, resolvedBookings, resolvedWinRate]
  );

  const reload = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.vendor.all });
  };

  return {
    summary,
    bookings: resolvedBookings,
    winRate: resolvedWinRate,
    earningsData,
    kpis,
    statusBreakdown,
    servicePerformance,
    upcomingBookings,
    isEmpty,
    showInitialSkeleton: loading,
    loading,
    refreshing,
    error,
    reload,
  };
}
