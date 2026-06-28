"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  getAdminVendorSummary,
  getAdminVendorsPage,
  type AdminVendor,
  type AdminVendorSummary,
  type PagedResult,
} from "@/shared/lib/api/admin";
import type { VendorDirectoryStatusTab } from "@/modules/admin/dashboard/adminVendorDirectoryHelpers";

export const VENDOR_DIRECTORY_PAGE_SIZE = 10;

export type UseAdminVendorDirectoryParams = {
  page: number;
  statusTab: VendorDirectoryStatusTab;
  search: string;
};

const EMPTY_PAGE: PagedResult<AdminVendor> = {
  items: [],
  page: 1,
  pageSize: VENDOR_DIRECTORY_PAGE_SIZE,
  totalCount: 0,
  totalPages: 0,
};

const EMPTY_SUMMARY: AdminVendorSummary = {
  total: 0,
  verified: 0,
  pending: 0,
  rejected: 0,
  liveListings: 0,
  categories: 0,
};

export function useAdminVendorDirectory({
  page,
  statusTab,
  search,
}: UseAdminVendorDirectoryParams) {
  const { user } = useAuth();
  const [summary, setSummary] = useState<AdminVendorSummary>(EMPTY_SUMMARY);
  const [pageResult, setPageResult] = useState<PagedResult<AdminVendor>>(EMPTY_PAGE);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    if (!user) return;
    const token = await user.getIdToken();
    const data = await getAdminVendorSummary(token);
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
        const result = await getAdminVendorsPage(token, {
          page,
          pageSize: VENDOR_DIRECTORY_PAGE_SIZE,
          status: statusTab,
          search,
        });
        setPageResult(result);
      } catch (err) {
        setPageResult(EMPTY_PAGE);
        setError(err instanceof Error ? err.message : "Failed to load vendors.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user, page, statusTab, search]
  );

  const reload = useCallback(async () => {
    await Promise.all([loadSummary(), loadPage(true)]);
  }, [loadSummary, loadPage]);

  useEffect(() => {
    void loadSummary().catch(() => {
      setSummary(EMPTY_SUMMARY);
    });
  }, [loadSummary]);

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  return {
    vendors: pageResult.items,
    pagination: pageResult,
    summary,
    loading,
    refreshing,
    error,
    reload,
  };
}
