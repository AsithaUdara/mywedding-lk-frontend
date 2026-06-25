import type { PlannerEventListItem } from "@/shared/lib/api/planner";
import type { Task } from "@/shared/lib/api/tasks";
import type { VendorShortlistItem } from "@/shared/lib/api/vendorShortlist";
import { formatEventKey } from "@/modules/planner/clients/plannerClientHelpers";
import {
  countDraftShortlist,
  countOverdueTasks,
  daysUntilWedding,
  isEventSetupIncomplete,
} from "@/modules/planner/dashboard/plannerDashboardHelpers";

export type PlannerEventPortfolioItem = {
  event: PlannerEventListItem;
  eventKey: string;
  daysUntil: number;
  needsSetup: boolean;
  overdueCount: number;
  draftShortlistCount: number;
  pendingBookings: number;
  taskProgress: number | null;
  taskCompleted: number;
  taskTotal: number;
};

function taskCompletionPercent(tasks: Task[]): {
  percent: number;
  total: number;
  completed: number;
} {
  if (tasks.length === 0) return { percent: 0, total: 0, completed: 0 };
  const completed = tasks.filter((t) => t.status === "Completed").length;
  return {
    percent: Math.round((completed / tasks.length) * 100),
    total: tasks.length,
    completed,
  };
}

export function mapEventToPortfolioItem(
  event: PlannerEventListItem,
  tasks: Task[] = [],
  shortlist: VendorShortlistItem[] = []
): PlannerEventPortfolioItem {
  const { percent, total, completed } = taskCompletionPercent(tasks);
  const requested = event.requestedBookings ?? 0;
  const confirmed = event.confirmedBookings ?? 0;

  return {
    event,
    eventKey: formatEventKey(event.eventId),
    daysUntil: daysUntilWedding(event.eventDate),
    needsSetup: isEventSetupIncomplete(event),
    overdueCount: countOverdueTasks(tasks),
    draftShortlistCount: countDraftShortlist(shortlist),
    pendingBookings: Math.max(0, requested - confirmed),
    taskProgress: total > 0 ? percent : null,
    taskCompleted: completed,
    taskTotal: total,
  };
}

export function countPortfolioAttention(items: PlannerEventPortfolioItem[]): number {
  return items.filter(
    (item) =>
      item.needsSetup ||
      item.overdueCount > 0 ||
      item.draftShortlistCount > 0 ||
      item.pendingBookings > 0
  ).length;
}

export function sortPortfolioByWeddingDate(
  items: PlannerEventPortfolioItem[]
): PlannerEventPortfolioItem[] {
  return [...items].sort(
    (a, b) => new Date(a.event.eventDate).getTime() - new Date(b.event.eventDate).getTime()
  );
}
