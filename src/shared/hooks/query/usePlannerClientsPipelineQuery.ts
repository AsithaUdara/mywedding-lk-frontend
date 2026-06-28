"use client";

import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  mapEventToPipelineCard,
  type ClientPipelineCard,
} from "@/modules/planner/clients/plannerClientHelpers";
import { getTasksForEvent } from "@/shared/lib/api/tasks";
import { queryKeys } from "@/shared/lib/query/queryKeys";
import { usePlannerEventsQuery } from "@/shared/hooks/query/usePlannerQueries";

/** Client kanban cards — events plus per-event tasks (cached, parallel). */
export function usePlannerClientsPipelineQuery() {
  const { user, loading: authLoading } = useAuth();
  const {
    data: events = [],
    isLoading: eventsLoading,
    error: eventsError,
    refetch: refetchEvents,
    isFetching: eventsFetching,
  } = usePlannerEventsQuery();

  const enabled = !authLoading && !!user && events.length > 0;

  const taskResults = useQueries({
    queries: events.map((event) => ({
      queryKey: queryKeys.events.tasks(event.eventId),
      enabled,
      staleTime: 60_000,
      queryFn: async () => {
        const token = await user!.getIdToken();
        return getTasksForEvent(token, event.eventId);
      },
    })),
  });

  const clients = useMemo((): ClientPipelineCard[] => {
    return events.map((event, index) => {
      const tasks = taskResults[index]?.data;
      return mapEventToPipelineCard(event, tasks ?? []);
    });
  }, [events, taskResults]);

  const tasksLoading = enabled && taskResults.some((r) => r.isLoading);

  return {
    clients,
    isLoading: eventsLoading || tasksLoading,
    isFetching: eventsFetching || taskResults.some((r) => r.isFetching),
    error: eventsError,
    refetch: refetchEvents,
  };
}
