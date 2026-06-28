"use client";

import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import type { PlannerEventListItem } from "@/shared/lib/api/planner";
import { getVendorShortlist, type VendorShortlistItem } from "@/shared/lib/api/vendorShortlist";
import { queryKeys } from "@/shared/lib/query/queryKeys";
import { usePlannerEventsQuery } from "@/shared/hooks/query/usePlannerQueries";

export type ProcurementEventRow = {
  event: PlannerEventListItem;
  shortlist: VendorShortlistItem[];
};

/** Procurement view — events with per-event vendor shortlists. */
export function usePlannerProcurementQuery() {
  const { user, loading: authLoading } = useAuth();
  const {
    data: events = [],
    isLoading: eventsLoading,
    error: eventsError,
    refetch: refetchEvents,
    isFetching: eventsFetching,
  } = usePlannerEventsQuery();

  const enabled = !authLoading && !!user && events.length > 0;

  const shortlistResults = useQueries({
    queries: events.map((event) => ({
      queryKey: queryKeys.events.shortlist(event.eventId),
      enabled,
      staleTime: 60_000,
      queryFn: async () => {
        const token = await user!.getIdToken();
        return getVendorShortlist(token, event.eventId);
      },
    })),
  });

  const rows = useMemo((): ProcurementEventRow[] => {
    return events.map((event, index) => ({
      event,
      shortlist: shortlistResults[index]?.data ?? [],
    }));
  }, [events, shortlistResults]);

  const shortlistsLoading = enabled && shortlistResults.some((r) => r.isLoading);

  return {
    rows,
    isLoading: eventsLoading || shortlistsLoading,
    isFetching: eventsFetching || shortlistResults.some((r) => r.isFetching),
    error: eventsError,
    refetch: refetchEvents,
  };
}
