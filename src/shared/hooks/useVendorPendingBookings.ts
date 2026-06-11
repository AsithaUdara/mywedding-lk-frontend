"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { getVendorBookings } from "@/shared/lib/api/vendors";
import { VENDOR_BOOKINGS_UPDATED } from "@/shared/lib/vendorBookingEvents";

export function useVendorPendingBookings() {
  const { user } = useAuth();
  const [requestedCount, setRequestedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setRequestedCount(0);
      setLoading(false);
      return;
    }

    try {
      const token = await user.getIdToken();
      const bookings = await getVendorBookings(token);
      setRequestedCount(bookings.filter((booking) => booking.status === "Requested").length);
    } catch {
      setRequestedCount(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

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
      loading,
      requestedCount,
      refresh,
    }),
    [loading, requestedCount, refresh]
  );
}
