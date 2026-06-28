"use client";

import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  mapEventToPortfolioItem,
  sortPortfolioByWeddingDate,
  type PlannerEventPortfolioItem,
} from "@/modules/planner/events/plannerEventHelpers";
import { getTasksForEvent } from "@/shared/lib/api/tasks";
import { getVendorShortlist } from "@/shared/lib/api/vendorShortlist";
import { queryKeys } from "@/shared/lib/query/queryKeys";
import { usePlannerEventsQuery } from "@/shared/hooks/query/usePlannerQueries";

/** Events portfolio — per-event tasks + shortlist (cached, parallel). */
export function usePlannerPortfolioQuery() {
  const { user, loading: authLoading } = useAuth();
  const {
    data: events = [],
    isLoading: eventsLoading,
    error: eventsError,
    refetch: refetchEvents,
    isFetching: eventsFetching,
  } = usePlannerEventsQuery();

  const enabled = !authLoading && !!user && events.length > 0;

  const detailResults = useQueries({
    queries: events.map((event) => ({
      queryKey: [...queryKeys.events.all, event.eventId, "portfolio"] as const,
      enabled,
      staleTime: 60_000,
      queryFn: async (): Promise<PlannerEventPortfolioItem> => {
        const token = await user!.getIdToken();
        try {
          const [tasks, shortlist] = await Promise.all([
            getTasksForEvent(token, event.eventId),
            getVendorShortlist(token, event.eventId),
          ]);
          return mapEventToPortfolioItem(event, tasks, shortlist);
        } catch {
          return mapEventToPortfolioItem(event, [], []);
        }
      },
    })),
  });

  const portfolio = useMemo(() => {
    const items = events.map(
      (event, index) =>
        detailResults[index]?.data ?? mapEventToPortfolioItem(event, [], [])
    );
    return sortPortfolioByWeddingDate(items);
  }, [events, detailResults]);

  const detailsLoading = enabled && detailResults.some((r) => r.isLoading);

  return {
    portfolio,
    isLoading: eventsLoading || detailsLoading,
    isFetching: eventsFetching || detailResults.some((r) => r.isFetching),
    error: eventsError,
    refetch: refetchEvents,
  };
}
