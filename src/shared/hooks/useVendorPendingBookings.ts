"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useVendorBookingsQuery } from "@/shared/hooks/query/useVendorQueries";
import { VENDOR_BOOKINGS_UPDATED } from "@/shared/lib/vendorBookingEvents";

export function useVendorPendingBookings() {
  const { data: bookings = [], isLoading, refetch, isFetching } = useVendorBookingsQuery();

  const requestedCount = useMemo(
    () => bookings.filter((booking) => booking.status === "Requested").length,
    [bookings]
  );

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  useEffect(() => {
    const handleUpdate = () => {
      void refresh();
    };

    window.addEventListener(VENDOR_BOOKINGS_UPDATED, handleUpdate);
    window.addEventListener("focus", handleUpdate);

    return () => {
      window.removeEventListener(VENDOR_BOOKINGS_UPDATED, handleUpdate);
      window.removeEventListener("focus", handleUpdate);
    };
  }, [refresh]);

  return useMemo(
    () => ({
      loading: isLoading,
      requestedCount,
      refresh,
      isFetching,
    }),
    [isLoading, requestedCount, refresh, isFetching]
  );
}
