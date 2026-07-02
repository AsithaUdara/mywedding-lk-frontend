"use client";

import { useQueries } from "@tanstack/react-query";
import { useAuth } from "@/shared/context/AuthContext";
import { getTasksForEvent } from "@/shared/lib/api/tasks";
import { getVendorShortlist } from "@/shared/lib/api/vendorShortlist";
import {
  countDraftShortlist,
  countOverdueTasks,
} from "@/modules/planner/dashboard/plannerDashboardHelpers";
import { queryKeys } from "@/shared/lib/query/queryKeys";

export type PlannerEventInsight = {
  eventId: string;
  overdue: number;
  draftShortlist: number;
};

/** Per-event overdue tasks + draft shortlist counts (parallel, cached). */
export function usePlannerEventInsights(eventIds: string[]) {
  const { user, loading: authLoading } = useAuth();
  const enabled = !authLoading && !!user && eventIds.length > 0;

  const results = useQueries({
    queries: eventIds.map((eventId) => ({
      queryKey: queryKeys.planner.eventInsights(eventId),
      enabled,
      staleTime: 60_000,
      queryFn: async (): Promise<PlannerEventInsight> => {
        const token = await user!.getIdToken();
        const [tasks, shortlist] = await Promise.all([
          getTasksForEvent(token, eventId),
          getVendorShortlist(token, eventId),
        ]);
        return {
          eventId,
          overdue: countOverdueTasks(tasks),
          draftShortlist: countDraftShortlist(shortlist),
        };
      },
    })),
  });

  const insightsLoading = enabled && results.some((r) => r.isLoading);
  const overdueByEvent = new Map<string, number>();
  const draftShortlistByEvent = new Map<string, number>();

  for (const result of results) {
    const data = result.data;
    if (!data) continue;
    if (data.overdue > 0) overdueByEvent.set(data.eventId, data.overdue);
    if (data.draftShortlist > 0) draftShortlistByEvent.set(data.eventId, data.draftShortlist);
  }

  return { overdueByEvent, draftShortlistByEvent, insightsLoading };
}
