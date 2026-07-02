"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  getPayoutDuePage,
  getPayoutDueSummary,
  markPayoutSettled,
  type PagedResult,
  type PayoutDueItem,
  type PayoutDueSummary,
} from "@/shared/lib/api/admin";

export const PAYOUT_QUEUE_PAGE_SIZE = 10;

export type UsePayoutQueueParams = {
  page: number;
  search: string;
};

const EMPTY_PAGE: PagedResult<PayoutDueItem> = {
  items: [],
  page: 1,
  pageSize: PAYOUT_QUEUE_PAGE_SIZE,
  totalCount: 0,
  totalPages: 0,
};

const EMPTY_SUMMARY: PayoutDueSummary = {
  count: 0,
  totalGross: 0,
  totalCommission: 0,
  totalVendorNet: 0,
};

export function usePayoutQueue({ page, search }: UsePayoutQueueParams) {
  const { user } = useAuth();
  const [summary, setSummary] = useState<PayoutDueSummary>(EMPTY_SUMMARY);
  const [pageResult, setPageResult] = useState<PagedResult<PayoutDueItem>>(EMPTY_PAGE);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    if (!user) return;
    const token = await user.getIdToken();
    const data = await getPayoutDueSummary(token);
    setSummary(data);
  }, [user]);

  const loadPage = useCallback(
    async (isRefresh = false) => {
      if (!user) return;
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        const token = await user.getIdToken();
        const result = await getPayoutDuePage(token, {
          page,
          pageSize: PAYOUT_QUEUE_PAGE_SIZE,
          search,
        });
        setPageResult(result);
      } catch (err) {
        setPageResult(EMPTY_PAGE);
        setError(err instanceof Error ? err.message : "Failed to load payout queue.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user, page, search]
  );

  const reload = useCallback(async () => {
    await Promise.all([loadSummary(), loadPage(true)]);
  }, [loadSummary, loadPage]);

  const markSettled = useCallback(
    async (item: PayoutDueItem) => {
      if (!user) return;
      setSettlingId(item.id);
      try {
        const token = await user.getIdToken();
        await markPayoutSettled(token, item.id);
        setToast(`Payout marked settled for booking ${item.bookingId.slice(0, 8)}.`);
        setError(null);
        await reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to mark payout as settled.");
      } finally {
        setSettlingId(null);
      }
    },
    [user, reload]
  );

  useEffect(() => {
    void loadSummary().catch(() => setSummary(EMPTY_SUMMARY));
  }, [loadSummary]);

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return {
    payouts: pageResult.items,
    pagination: pageResult,
    summary,
    loading,
    refreshing,
    error,
    settlingId,
    toast,
    reload,
    markSettled,
    syncPage: () => loadPage(true),
  };
}
