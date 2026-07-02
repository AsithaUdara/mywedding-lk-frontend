"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  getPayoutDueSummary,
  getPendingVendors,
  getPlatformAnalytics,
  type PayoutDueSummary,
  type PendingVendor,
  type PlatformAnalytics,
} from "@/shared/lib/api/admin";

const EMPTY_PAYOUT_SUMMARY: PayoutDueSummary = {
  count: 0,
  totalGross: 0,
  totalCommission: 0,
  totalVendorNet: 0,
};

export function useAdminDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [pendingVendors, setPendingVendors] = useState<PendingVendor[]>([]);
  const [payoutSummary, setPayoutSummary] = useState<PayoutDueSummary>(EMPTY_PAYOUT_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!user) return;
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        const token = await user.getIdToken();
        const [analyticsData, pending, payouts] = await Promise.all([
          getPlatformAnalytics(token),
          getPendingVendors(token),
          getPayoutDueSummary(token),
        ]);

        setAnalytics(analyticsData);
        setPendingVendors(pending);
        setPayoutSummary(payouts);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load admin overview.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user]
  );

  useEffect(() => {
    void load();
  }, [load]);

  return {
    analytics,
    pendingVendors,
    payoutSummary,
    loading,
    refreshing,
    error,
    reload: () => load(true),
  };
}
