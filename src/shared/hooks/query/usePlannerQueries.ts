"use client";

import { useAuthedQuery } from "@/shared/hooks/query/useAuthedQuery";
import {
  getPlannerBookings,
  getPlannerDashboard,
  getPlannerEvents,
  getPlannerOverview,
} from "@/shared/lib/api/planner";
import { getPlannerTaskTemplates } from "@/shared/lib/api/plannerTaskTemplates";
import { queryKeys } from "@/shared/lib/query/queryKeys";

const STALE_MS = 60_000;

export function usePlannerDashboardQuery() {
  return useAuthedQuery({
    queryKey: queryKeys.planner.dashboard(),
    queryFn: getPlannerDashboard,
    staleTime: STALE_MS,
  });
}

export function usePlannerOverviewQuery() {
  return useAuthedQuery({
    queryKey: queryKeys.planner.overview(),
    queryFn: getPlannerOverview,
    staleTime: STALE_MS,
  });
}

export function usePlannerEventsQuery(status?: string) {
  return useAuthedQuery({
    queryKey: queryKeys.planner.events(status),
    queryFn: (token) => getPlannerEvents(token, status),
    staleTime: STALE_MS,
  });
}

export function usePlannerTaskTemplatesQuery(enabled = true) {
  return useAuthedQuery({
    queryKey: queryKeys.planner.taskTemplates(),
    queryFn: getPlannerTaskTemplates,
    enabled,
    staleTime: STALE_MS,
  });
}

export function usePlannerBookingsQuery() {
  return useAuthedQuery({
    queryKey: queryKeys.planner.bookings(),
    queryFn: getPlannerBookings,
    staleTime: STALE_MS,
  });
}
