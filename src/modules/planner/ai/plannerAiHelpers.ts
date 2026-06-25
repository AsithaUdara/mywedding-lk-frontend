import type { PlannerEventListItem } from "@/shared/lib/api/planner";
import { formatEventKey } from "@/modules/planner/clients/plannerClientHelpers";
import {
  daysUntilWedding,
  formatWeddingDate,
} from "@/modules/planner/dashboard/plannerDashboardHelpers";

export type AiTool = "tasks" | "vendors";

export type AiPortfolioStats = {
  activeWeddings: number;
  portfolioTotal: number;
  readyForTasks: number;
  readyForVendors: number;
};

export type AiEventContext = {
  event: PlannerEventListItem;
  eventKey: string;
  weddingDateLabel: string;
  daysUntil: number;
};

export function computeAiPortfolioStats(events: PlannerEventListItem[]): AiPortfolioStats {
  const active = events.filter((event) => event.status === "Active");
  return {
    activeWeddings: active.length,
    portfolioTotal: events.length,
    readyForTasks: active.length,
    readyForVendors: active.length,
  };
}

export function mapEventToAiContext(event: PlannerEventListItem): AiEventContext {
  return {
    event,
    eventKey: formatEventKey(event.eventId),
    weddingDateLabel: formatWeddingDate(event.eventDate),
    daysUntil: daysUntilWedding(event.eventDate),
  };
}

export function eventsForAiWorkflow(events: PlannerEventListItem[]): PlannerEventListItem[] {
  return events.filter((event) => event.status === "Active" || event.status === "OnHold");
}

export function parseAiTool(value: string | null): AiTool {
  return value === "vendors" ? "vendors" : "tasks";
}

export const AI_JIRA_INPUT =
  "w-full rounded border border-[#DFE1E6] bg-white px-3 py-2 text-sm text-[#172B4D] outline-none transition-colors placeholder:text-[#97A0AF] focus:border-primary focus:ring-2 focus:ring-primary/20";
