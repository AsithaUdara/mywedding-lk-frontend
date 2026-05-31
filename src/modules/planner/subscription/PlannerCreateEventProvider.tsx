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
import { PlannerCreateEventModal } from "@/modules/planner/subscription/PlannerCreateEventModal";

export const PLANNER_EVENT_CREATED = "planner:event-created";

type PlannerCreateEventContextValue = {
  openCreateEventModal: () => void;
};

const PlannerCreateEventContext = createContext<PlannerCreateEventContextValue | null>(null);

export function PlannerCreateEventProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openCreateEventModal = useCallback(() => setOpen(true), []);
  const closeCreateEventModal = useCallback(() => setOpen(false), []);

  const handleCreated = useCallback(() => {
    window.dispatchEvent(new CustomEvent(PLANNER_EVENT_CREATED));
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
export function usePlannerEventCreated(onCreated: () => void) {
  useEffect(() => {
    const handler = () => onCreated();
    window.addEventListener(PLANNER_EVENT_CREATED, handler);
    return () => window.removeEventListener(PLANNER_EVENT_CREATED, handler);
  }, [onCreated]);
}
