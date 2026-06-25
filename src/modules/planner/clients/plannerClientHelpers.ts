import type { PlannerEventListItem } from "@/shared/lib/api/planner";
import type { Task } from "@/shared/lib/api/tasks";
import {
  countOverdueTasks,
  daysUntilWedding,
  isEventSetupIncomplete,
} from "@/modules/planner/dashboard/plannerDashboardHelpers";

export type PipelinePriority = "Urgent" | "High" | "Medium" | "Low";

export type ClientPipelineCard = {
  id: string;
  eventKey: string;
  title: string;
  weddingDate: string;
  weddingDateShort: string;
  daysUntil: number;
  budget: number;
  budgetLabel: string;
  stage: PlannerEventListItem["eventLifecycleStage"];
  taskPlanPhase: PlannerEventListItem["taskPlanPhase"];
  taskProgress: number | null;
  taskTotal: number;
  taskCompleted: number;
  overdueCount: number;
  priority: PipelinePriority;
  nextAction: string;
  needsSetup: boolean;
  clientInitials: string;
};

export function formatEventKey(eventId: string): string {
  return `WED-${eventId.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

export function formatBudgetCompact(lkr: number): string {
  if (lkr >= 1_000_000) return `LKR ${(lkr / 1_000_000).toFixed(1)}M`;
  if (lkr >= 1_000) return `LKR ${Math.round(lkr / 1_000)}K`;
  return `LKR ${lkr.toLocaleString()}`;
}

export function urgencyPriority(daysUntil: number): PipelinePriority {
  if (daysUntil <= 90) return "Urgent";
  if (daysUntil <= 180) return "High";
  if (daysUntil <= 365) return "Medium";
  return "Low";
}

export function initialsFromTitle(title: string): string {
  const words = title.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export function shortWeddingDate(eventDate: string): string {
  return new Date(eventDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function taskCompletionPercent(tasks: Task[]): {
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

export function nextActionForEvent(
  event: PlannerEventListItem,
  taskProgress: number | null
): string {
  if (event.taskPlanPhase === "None") {
    return "Add tasks or apply a template";
  }
  if (event.taskPlanPhase === "Discovery" || event.eventLifecycleStage === "Onboarding") {
    return "Complete couple brief & checklist";
  }
  if (taskProgress !== null && taskProgress < 50) {
    return "Keep timeline on track";
  }
  if (event.requestedBookings > event.confirmedBookings) {
    return "Follow up vendor bookings";
  }
  return "Review timeline & procurement";
}

export function mapEventToPipelineCard(
  event: PlannerEventListItem,
  tasks: Task[] = []
): ClientPipelineCard {
  const { percent, total, completed } = taskCompletionPercent(tasks);
  const stage = event.eventLifecycleStage ?? "Planning";
  const daysUntil = daysUntilWedding(event.eventDate);

  return {
    id: event.eventId,
    eventKey: formatEventKey(event.eventId),
    title: event.eventName,
    weddingDate: event.eventDate,
    weddingDateShort: shortWeddingDate(event.eventDate),
    daysUntil,
    budget: event.totalBudget,
    budgetLabel: formatBudgetCompact(event.totalBudget),
    stage,
    taskPlanPhase: event.taskPlanPhase ?? "None",
    taskProgress: total > 0 ? percent : null,
    taskTotal: total,
    taskCompleted: completed,
    overdueCount: countOverdueTasks(tasks),
    priority: urgencyPriority(daysUntil),
    nextAction: nextActionForEvent(event, total > 0 ? percent : null),
    needsSetup: isEventSetupIncomplete(event),
    clientInitials: initialsFromTitle(event.eventName),
  };
}

export const PIPELINE_STAGES: PlannerEventListItem["eventLifecycleStage"][] = [
  "Lead",
  "Onboarding",
  "Planning",
  "Execution",
  "Archived",
];

export const STAGE_HINTS: Record<string, string> = {
  Lead: "New inquiry — not yet onboarded",
  Onboarding: "Brief & discovery checklist",
  Planning: "Vendors, timeline, client approvals",
  Execution: "Final month & wedding week",
  Archived: "Completed or closed",
};
