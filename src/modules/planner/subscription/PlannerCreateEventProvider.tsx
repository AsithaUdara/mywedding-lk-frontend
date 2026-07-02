"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CreatePlannerEventResult } from "@/shared/lib/api/planner";
import { PlannerCreateEventModal } from "@/modules/planner/subscription/PlannerCreateEventModal";

export const PLANNER_EVENT_CREATED = "planner:event-created";

export type PlannerEventCreatedDetail = CreatePlannerEventResult;

type PlannerCreateEventContextValue = {
  openCreateEventModal: () => void;
};

const PlannerCreateEventContext = createContext<PlannerCreateEventContextValue | null>(null);

export function PlannerCreateEventProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openCreateEventModal = useCallback(() => setOpen(true), []);
  const closeCreateEventModal = useCallback(() => setOpen(false), []);

  const handleCreated = useCallback((result: CreatePlannerEventResult) => {
    window.dispatchEvent(
      new CustomEvent<PlannerEventCreatedDetail>(PLANNER_EVENT_CREATED, { detail: result })
    );
  }, []);

  const value = useMemo(() => ({ openCreateEventModal }), [openCreateEventModal]);

  return (
    <PlannerCreateEventContext.Provider value={value}>
      {children}
      <PlannerCreateEventModal
        open={open}
        onClose={closeCreateEventModal}
        onCreated={handleCreated}
      />
    </PlannerCreateEventContext.Provider>
  );
}

export function usePlannerCreateEventModal() {
  const ctx = useContext(PlannerCreateEventContext);
  if (!ctx) {
    throw new Error("usePlannerCreateEventModal must be used within PlannerCreateEventProvider");
  }
  return ctx;
}

/** Refresh lists when a planner creates an event from the shared modal. */
export function usePlannerEventCreated(onCreated: (detail?: PlannerEventCreatedDetail) => void) {
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<PlannerEventCreatedDetail>).detail;
      onCreated(detail);
    };
    window.addEventListener(PLANNER_EVENT_CREATED, handler);
    return () => window.removeEventListener(PLANNER_EVENT_CREATED, handler);
  }, [onCreated]);
}
