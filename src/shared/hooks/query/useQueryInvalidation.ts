"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type { PlannerEventListItem } from "@/shared/lib/api/planner";
import { queryKeys } from "@/shared/lib/query/queryKeys";

export function usePlannerQueryInvalidation() {
  const queryClient = useQueryClient();

  const invalidatePlannerEvents = useCallback(
    () => queryClient.invalidateQueries({ queryKey: queryKeys.planner.events() }),
    [queryClient]
  );

  const invalidatePlannerAll = useCallback(
    () => queryClient.invalidateQueries({ queryKey: queryKeys.planner.all }),
    [queryClient]
  );

  const invalidateEventTasks = useCallback(
    (eventId: string) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.events.tasks(eventId) }),
    [queryClient]
  );

  const invalidateEventBrief = useCallback(
    (eventId: string) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.events.brief(eventId) }),
    [queryClient]
  );

  const invalidateEventShortlist = useCallback(
    (eventId: string) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.events.shortlist(eventId) }),
    [queryClient]
  );

  const invalidateEventBudget = useCallback(
    (eventId: string) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.events.budget(eventId) }),
    [queryClient]
  );

  const patchPlannerEvent = useCallback(
    (eventId: string, patch: Partial<PlannerEventListItem>) => {
      queryClient.setQueryData<PlannerEventListItem[]>(
        queryKeys.planner.events(),
        (prev) => prev?.map((ev) => (ev.eventId === eventId ? { ...ev, ...patch } : ev))
      );
    },
    [queryClient]
  );

  return {
    queryClient,
    invalidatePlannerEvents,
    invalidatePlannerAll,
    invalidateEventTasks,
    invalidateEventBrief,
    invalidateEventShortlist,
    invalidateEventBudget,
    patchPlannerEvent,
  };
}
