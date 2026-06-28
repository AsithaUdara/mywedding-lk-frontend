"use client";

import { useAuthedQuery } from "@/shared/hooks/query/useAuthedQuery";
import { getBudgetOverview, getExpenses } from "@/shared/lib/api/budget";
import { getEventBrief } from "@/shared/lib/api/eventBrief";
import { getTasksForEvent } from "@/shared/lib/api/tasks";
import { getVendorShortlist } from "@/shared/lib/api/vendorShortlist";
import { queryKeys } from "@/shared/lib/query/queryKeys";

const STALE_MS = 30_000;

export function useEventTasksQuery(eventId: string | undefined) {
  return useAuthedQuery({
    queryKey: queryKeys.events.tasks(eventId ?? ""),
    queryFn: (token) => getTasksForEvent(token, eventId!),
    enabled: !!eventId,
    staleTime: STALE_MS,
  });
}

export function useEventBriefQuery(eventId: string | undefined) {
  return useAuthedQuery({
    queryKey: queryKeys.events.brief(eventId ?? ""),
    queryFn: (token) => getEventBrief(token, eventId!),
    enabled: !!eventId,
    staleTime: STALE_MS,
  });
}

export function useEventShortlistQuery(eventId: string | undefined) {
  return useAuthedQuery({
    queryKey: queryKeys.events.shortlist(eventId ?? ""),
    queryFn: (token) => getVendorShortlist(token, eventId!),
    enabled: !!eventId,
    staleTime: STALE_MS,
  });
}

export function useEventBudgetOverviewQuery(eventId: string | undefined) {
  return useAuthedQuery({
    queryKey: queryKeys.events.budget(eventId ?? ""),
    queryFn: (token) => getBudgetOverview(token, eventId!),
    enabled: !!eventId,
    staleTime: STALE_MS,
  });
}

export function useEventExpensesQuery(eventId: string | undefined) {
  return useAuthedQuery({
    queryKey: queryKeys.events.expenses(eventId ?? ""),
    queryFn: (token) => getExpenses(token, eventId!),
    enabled: !!eventId,
    staleTime: STALE_MS,
  });
}
