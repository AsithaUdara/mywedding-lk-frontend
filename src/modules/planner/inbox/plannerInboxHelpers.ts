import type { PlannerEventListItem } from "@/shared/lib/api/planner";
import { formatEventKey } from "@/modules/planner/clients/plannerClientHelpers";
import { daysUntilWedding, formatWeddingDate } from "@/modules/planner/dashboard/plannerDashboardHelpers";

export type InboxFilter = "all" | "active" | "awaiting";

export type InboxEventSummary = {
  event: PlannerEventListItem;
  eventKey: string;
  weddingDateLabel: string;
  daysUntil: number;
  awaiting: number;
  confirmed: number;
  completed: number;
  totalConversations: number;
  progressPercent: number;
  needsReply: boolean;
};

export type InboxPortfolioStats = {
  awaitingVendor: number;
  confirmed: number;
  completed: number;
  weddingsNeedingReply: number;
  activeWeddings: number;
};

export function computeInboxStats(events: PlannerEventListItem[]): InboxPortfolioStats {
  return events.reduce(
    (acc, event) => {
      acc.awaitingVendor += event.requestedBookings ?? 0;
      acc.confirmed += event.confirmedBookings ?? 0;
      acc.completed += event.completedBookings ?? 0;
      if ((event.requestedBookings ?? 0) > 0) acc.weddingsNeedingReply += 1;
      if (event.status === "Active") acc.activeWeddings += 1;
      return acc;
    },
    {
      awaitingVendor: 0,
      confirmed: 0,
      completed: 0,
      weddingsNeedingReply: 0,
      activeWeddings: 0,
    }
  );
}

export function mapEventToInboxSummary(event: PlannerEventListItem): InboxEventSummary {
  const awaiting = event.requestedBookings ?? 0;
  const confirmed = event.confirmedBookings ?? 0;
  const completed = event.completedBookings ?? 0;
  const totalConversations = awaiting + confirmed + completed;
  const resolved = confirmed + completed;

  return {
    event,
    eventKey: formatEventKey(event.eventId),
    weddingDateLabel: formatWeddingDate(event.eventDate),
    daysUntil: daysUntilWedding(event.eventDate),
    awaiting,
    confirmed,
    completed,
    totalConversations,
    progressPercent: totalConversations > 0 ? Math.round((resolved / totalConversations) * 100) : 0,
    needsReply: awaiting > 0,
  };
}

export function filterInboxSummaries(
  summaries: InboxEventSummary[],
  filter: InboxFilter
): InboxEventSummary[] {
  let list = [...summaries];
  if (filter === "active") {
    list = list.filter((item) => item.event.status === "Active");
  }
  if (filter === "awaiting") {
    list = list.filter((item) => item.needsReply);
  }
  return list.sort((a, b) => {
    if (b.awaiting !== a.awaiting) return b.awaiting - a.awaiting;
    return new Date(a.event.eventDate).getTime() - new Date(b.event.eventDate).getTime();
  });
}

export function inboxFilterCounts(summaries: InboxEventSummary[]): Record<InboxFilter, number> {
  return {
    all: summaries.length,
    active: summaries.filter((item) => item.event.status === "Active").length,
    awaiting: summaries.filter((item) => item.needsReply).length,
  };
}
