"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  getAdminEventAuditLogPage,
  getAdminEventAuditSummary,
  type AuditLogItem,
  type EventAuditSummary,
  type PagedResult,
} from "@/shared/lib/api/admin";

export const AUDIT_LOG_PAGE_SIZE = 10;

export type UseEventAuditLogParams = {
  eventId: string | null;
  page: number;
  search: string;
  actionType: string;
};

const EMPTY_PAGE: PagedResult<AuditLogItem> = {
  items: [],
  page: 1,
  pageSize: AUDIT_LOG_PAGE_SIZE,
  totalCount: 0,
  totalPages: 0,
};

export function useEventAuditLog({
  eventId,
  page,
  search,
  actionType,
}: UseEventAuditLogParams) {
  const { user } = useAuth();
  const [summary, setSummary] = useState<EventAuditSummary | null>(null);
  const [pageResult, setPageResult] = useState<PagedResult<AuditLogItem>>(EMPTY_PAGE);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const loadPage = useCallback(
    async (isRefresh = false) => {
      if (!user || !eventId) return;
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);
        setNotFound(false);

        const token = await user.getIdToken();
        const [summaryData, result] = await Promise.all([
          getAdminEventAuditSummary(token, eventId),
          getAdminEventAuditLogPage(token, eventId, {
            page,
            pageSize: AUDIT_LOG_PAGE_SIZE,
            search,
            actionType: actionType === "All" ? undefined : actionType,
          }),
        ]);

        if (!summaryData) {
          setSummary(null);
          setPageResult(EMPTY_PAGE);
          setNotFound(true);
          return;
        }

        setSummary(summaryData);
        setPageResult(result);
      } catch (err) {
        setPageResult(EMPTY_PAGE);
        setError(err instanceof Error ? err.message : "Failed to load audit log.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user, eventId, page, search, actionType]
  );

  const reload = useCallback(async () => {
    await loadPage(true);
  }, [loadPage]);

  useEffect(() => {
    if (!eventId) {
      setSummary(null);
      setPageResult(EMPTY_PAGE);
      setNotFound(false);
      setError(null);
      return;
    }
    void loadPage();
  }, [eventId, loadPage]);

  return {
    entries: pageResult.items,
    pagination: pageResult,
    summary,
    loading,
    refreshing,
    error,
    notFound,
    reload,
  };
}
