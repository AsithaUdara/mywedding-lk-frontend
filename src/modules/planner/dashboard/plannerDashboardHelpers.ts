import type { PlannerEventListItem, PlannerOverviewResponse } from "@/shared/lib/api/planner";
import type { Task } from "@/shared/lib/api/tasks";
import type { VendorShortlistItem } from "@/shared/lib/api/vendorShortlist";

export type AttentionItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  tone: "warning" | "primary" | "neutral";
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function daysUntilWedding(eventDate: string): number {
  const wedding = new Date(eventDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  wedding.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((wedding.getTime() - today.getTime()) / MS_PER_DAY));
}

export function taskPlanLabel(phase: PlannerEventListItem["taskPlanPhase"]): string {
  switch (phase) {
    case "Full":
      return "Full checklist";
    case "Discovery":
      return "Discovery setup";
    case "None":
      return "No tasks yet";
    default:
      return "Planning";
  }
}

export function lifecycleLabel(stage: PlannerEventListItem["eventLifecycleStage"]): string {
  return stage ?? "Planning";
}

export function formatWeddingDate(eventDate: string): string {
  return new Date(eventDate).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function isEventSetupIncomplete(event: PlannerEventListItem): boolean {
  return (
    event.eventLifecycleStage === "Lead" ||
    event.eventLifecycleStage === "Onboarding" ||
    event.taskPlanPhase === "Discovery" ||
    event.taskPlanPhase === "None"
  );
}

export function buildAttentionItems(
  events: PlannerEventListItem[],
  overview: PlannerOverviewResponse | null,
  overdueByEvent: Map<string, number>,
  draftShortlistByEvent: Map<string, number>
): AttentionItem[] {
  const items: AttentionItem[] = [];

  for (const event of events) {
    if (isEventSetupIncomplete(event)) {
      items.push({
        id: `setup-${event.eventId}`,
        title: event.eventName,
        description:
          event.taskPlanPhase === "None"
            ? "No checklist yet — add tasks or apply a template"
            : "Setup in progress — complete brief and master checklist",
        href: `/planner/tasks?eventId=${encodeURIComponent(event.eventId)}`,
        tone: "warning",
      });
    }

    const overdue = overdueByEvent.get(event.eventId) ?? 0;
    if (overdue > 0) {
      items.push({
        id: `overdue-${event.eventId}`,
        title: event.eventName,
        description: `${overdue} overdue task${overdue === 1 ? "" : "s"} on timeline`,
        href: `/planner/tasks?eventId=${encodeURIComponent(event.eventId)}`,
        tone: "warning",
      });
    }

    const drafts = draftShortlistByEvent.get(event.eventId) ?? 0;
    if (drafts > 0) {
      items.push({
        id: `drafts-${event.eventId}`,
        title: event.eventName,
        description: `${drafts} vendor proposal${drafts === 1 ? "" : "s"} in draft — send to client`,
        href: `/planner/procurement?eventId=${encodeURIComponent(event.eventId)}`,
        tone: "primary",
      });
    }
  }

  const pending = overview?.pendingBookings ?? 0;
  if (pending > 0) {
    items.push({
      id: "pending-bookings",
      title: "Vendor bookings",
      description: `${pending} booking${pending === 1 ? "" : "s"} pending vendor or payment`,
      href: "/planner/bookings",
      tone: "warning",
    });
  }

  return items.slice(0, 8);
}

export function countOverdueTasks(tasks: Task[]): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return tasks.filter((t) => {
    if (t.status === "Completed" || !t.dueDate) return false;
    const due = new Date(t.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  }).length;
}

export function countDraftShortlist(items: VendorShortlistItem[]): number {
  return items.filter((i) => i.status === "Draft").length;
}

export function findNextWedding(events: PlannerEventListItem[]): PlannerEventListItem | null {
  const now = Date.now();
  const upcoming = events
    .filter((e) => new Date(e.eventDate).getTime() >= now - MS_PER_DAY)
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  return upcoming[0] ?? null;
}

export function countNeedsAttention(
  attentionItems: AttentionItem[],
  overview: PlannerOverviewResponse | null
): number {
  if (attentionItems.length > 0) return attentionItems.length;
  return overview?.pendingBookings ?? 0;
}
