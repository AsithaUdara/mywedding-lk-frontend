"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { updateBookingStatus } from "@/shared/lib/api/bookings";
import type { VendorBookingItem } from "@/shared/lib/api/vendors";
import { acceptVendorBooking, declineVendorBooking } from "@/shared/lib/api/vendorShortlist";
import { useVendorBookingsQuery } from "@/shared/hooks/query/useVendorQueries";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/query/queryKeys";
import {
  dispatchVendorBookingsUpdated,
  VENDOR_BOOKINGS_UPDATED,
} from "@/shared/lib/vendorBookingEvents";
import {
  computeBookingQueueStats,
  filterBookingQueue,
  sortBookingsForQueue,
  type BookingQueueFilter,
} from "@/modules/vendor/dashboard/vendorBookingHelpers";

export function useVendorBookingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: rawBookings = [],
    isLoading: loading,
    isFetching,
    error: queryError,
    refetch,
  } = useVendorBookingsQuery();

  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<BookingQueueFilter>("all");
  const [search, setSearch] = useState("");

  const bookings = useMemo(() => sortBookingsForQueue(rawBookings), [rawBookings]);
  const stats = useMemo(() => computeBookingQueueStats(bookings), [bookings]);
  const filteredBookings = useMemo(
    () => filterBookingQueue(bookings, filter, search),
    [bookings, filter, search]
  );

  const showInitialSkeleton = loading;
  const isRefreshing = isFetching && !loading;

  useEffect(() => {
    if (queryError) setError(queryError.message);
  }, [queryError]);

  const reload = useCallback(
    async (notifyOthers = false) => {
      await refetch();
      if (notifyOthers) dispatchVendorBookingsUpdated();
    },
    [refetch]
  );

  useEffect(() => {
    const handleUpdate = () => {
      void reload();
    };
    window.addEventListener(VENDOR_BOOKINGS_UPDATED, handleUpdate);
    return () => window.removeEventListener(VENDOR_BOOKINGS_UPDATED, handleUpdate);
  }, [reload]);

  const patchBookingStatus = useCallback(
    (bookingId: string, status: string) => {
      const queryKey = queryKeys.vendor.bookings();
      const previous = queryClient.getQueryData<VendorBookingItem[]>(queryKey);
      if (!previous) return previous;

      const next = previous.map((booking) =>
        booking.bookingId === bookingId ? { ...booking, status } : booking
      );
      queryClient.setQueryData(queryKey, next);
      return previous;
    },
    [queryClient]
  );

  const handleAcceptBooking = useCallback(
    async (bookingId: string) => {
      if (!user) return;
      const previous = patchBookingStatus(bookingId, "AwaitingPayment");

      try {
        setActionLoading(bookingId);
        const token = await user.getIdToken();
        await acceptVendorBooking(token, bookingId);
        await reload(true);
      } catch (err: unknown) {
        if (previous) queryClient.setQueryData(queryKeys.vendor.bookings(), previous);
        setError(err instanceof Error ? err.message : "Failed to accept booking.");
      } finally {
        setActionLoading(null);
      }
    },
    [user, patchBookingStatus, reload, queryClient]
  );

  const handleDeclineBooking = useCallback(
    async (bookingId: string) => {
      if (!user) return;
      const previous = patchBookingStatus(bookingId, "Cancelled");

      try {
        setActionLoading(bookingId);
        const token = await user.getIdToken();
        await declineVendorBooking(token, bookingId);
        await reload(true);
      } catch (err: unknown) {
        if (previous) queryClient.setQueryData(queryKeys.vendor.bookings(), previous);
        setError(err instanceof Error ? err.message : "Failed to decline booking.");
      } finally {
        setActionLoading(null);
      }
    },
    [user, patchBookingStatus, reload, queryClient]
  );

  const handleMarkCompleted = useCallback(
    async (bookingId: string) => {
      if (!user) return;
      const previous = patchBookingStatus(bookingId, "Completed");

      try {
        setActionLoading(bookingId);
        const token = await user.getIdToken();
        await updateBookingStatus(token, bookingId, "Completed");
        await reload(true);
      } catch (err: unknown) {
        if (previous) queryClient.setQueryData(queryKeys.vendor.bookings(), previous);
        setError(err instanceof Error ? err.message : "Failed to update status.");
      } finally {
        setActionLoading(null);
      }
    },
    [user, patchBookingStatus, reload, queryClient]
  );

  const focusRequests = useCallback(() => {
    setFilter("Requested");
    setSearch("");
  }, []);

  return {
    bookings,
    filteredBookings,
    stats,
    filter,
    setFilter,
    search,
    setSearch,
    actionLoading,
    showInitialSkeleton,
    isRefreshing,
    error,
    reload,
    handleAcceptBooking,
    handleDeclineBooking,
    handleMarkCompleted,
    focusRequests,
  };
}
