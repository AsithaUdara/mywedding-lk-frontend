import type { PipelinePriority } from "@/modules/planner/clients/plannerClientHelpers";
import type { ClientPipelineCard } from "@/modules/planner/clients/plannerClientHelpers";
import type { Task } from "@/shared/lib/api/tasks";
import { ChevronDown, ChevronUp, Equal } from "lucide-react";

/**
 * Planner workspace semantic colors — Regal Frost (maroon · antique gold · porcelain).
 * Shared by cards, lozenges, priority bars, and pipeline controls.
 */
export const plannerLozenge = {
  neutral: "bg-muted/70 text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  accent: "bg-[hsl(42_48%_52%/0.14)] text-[hsl(42_42%_38%)]",
  warning: "bg-[hsl(42_48%_52%/0.18)] text-[hsl(42_38%_32%)]",
  urgent: "bg-primary/12 text-primary ring-1 ring-primary/15",
  success: "bg-[hsl(42_48%_52%/0.14)] text-[hsl(42_42%_35%)]",
} as const;

export const PLANNER_PRIORITY_STYLES: Record<
  PipelinePriority,
  { border: string; icon: typeof ChevronUp; iconClass: string; label: string }
> = {
  Urgent: {
    border: "border-l-primary",
    icon: ChevronUp,
    iconClass: "text-primary",
    label: "Urgent",
  },
  High: {
    border: "border-l-[hsl(42_42%_38%)]",
    icon: ChevronUp,
    iconClass: "text-[hsl(42_42%_38%)]",
    label: "High",
  },
  Medium: {
    border: "border-l-[hsl(42_48%_52%)]",
    icon: Equal,
    iconClass: "text-[hsl(42_48%_52%)]",
    label: "Medium",
  },
  Low: {
    border: "border-l-[#C9BCA8]",
    icon: ChevronDown,
    iconClass: "text-muted-foreground",
    label: "Low",
  },
};

export const PLANNER_TASK_STATUS: Record<
  Task["status"],
  { label: string; className: string }
> = {
  ToDo: {
    label: "To do",
    className: plannerLozenge.neutral,
  },
  InProgress: {
    label: "In progress",
    className: plannerLozenge.primary,
  },
  Completed: {
    label: "Done",
    className: plannerLozenge.success,
  },
};

/** @deprecated Use PLANNER_TASK_STATUS */
export const JIRA_STATUS = PLANNER_TASK_STATUS;

export const PLANNER_BOOKING_STATUS_LOZENGE: Record<string, string> = {
  Requested: plannerLozenge.warning,
  AwaitingPayment: plannerLozenge.primary,
  Confirmed: plannerLozenge.success,
  Completed: plannerLozenge.neutral,
  Cancelled: plannerLozenge.urgent,
};

export const PLANNER_PROPOSAL_STATUS_LOZENGE: Record<string, string> = {
  Draft: plannerLozenge.neutral,
  Pending: plannerLozenge.warning,
  Approved: plannerLozenge.primary,
  Requested: plannerLozenge.warning,
  AwaitingPayment: plannerLozenge.primary,
  Confirmed: plannerLozenge.success,
  Rejected: plannerLozenge.urgent,
};

export const PLANNER_PHASE_LABELS: Record<
  ClientPipelineCard["taskPlanPhase"],
  { text: string; className: string } | null
> = {
  Discovery: {
    text: "Discovery",
    className: plannerLozenge.primary,
  },
  Full: {
    text: "Full checklist",
    className: plannerLozenge.accent,
  },
  None: {
    text: "No tasks",
    className: plannerLozenge.neutral,
  },
};

export const plannerBadge = {
  overdue: plannerLozenge.urgent,
  dueThisWeek: plannerLozenge.warning,
  setup: plannerLozenge.urgent,
  budget: plannerLozenge.accent,
} as const;

export const PLANNER_PIPELINE_STEP = {
  active: "border-primary bg-primary/[0.06] shadow-sm",
  hasItems:
    "border-[hsl(42_48%_52%/0.28)] bg-white hover:border-primary/35 hover:bg-[#FAFBFC]",
  empty: "border-[#EBECF0] bg-[#FAFBFC] text-[#97A0AF]",
} as const;

export const TASK_OVERDUE_RING = "ring-1 ring-primary/20";

export function proposalStatusLozengeClass(badgeKey: string): string {
  return PLANNER_PROPOSAL_STATUS_LOZENGE[badgeKey] ?? plannerLozenge.neutral;
}

export function bookingStatusLozengeClass(status: string): string {
  return PLANNER_BOOKING_STATUS_LOZENGE[status] ?? plannerLozenge.neutral;
}

export function taskPriorityBadgeClass(priority: string): string {
  const p = priority.toLowerCase();
  if (p === "high") return plannerLozenge.urgent;
  if (p === "low") return plannerLozenge.neutral;
  return plannerLozenge.warning;
}

export function paymentStatusTextClass(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === "paid") return "text-[hsl(42_42%_35%)]";
  if (normalized === "pending") return "text-[hsl(42_38%_32%)]";
  return "text-muted-foreground";
}

/** Panels, icon wells, and plan cards — billing & account pages */
export const plannerSurface = {
  infoPanel: "border-primary/15 bg-primary/[0.05]",
  infoIcon: "text-primary",
  iconWellPrimary: "bg-primary/10 text-primary",
  iconWellAccent: "bg-[hsl(42_48%_52%/0.14)] text-[hsl(42_42%_38%)]",
  noticePanel: "border-[hsl(42_48%_52%/0.22)] bg-[hsl(42_48%_52%/0.08)]",
  alertPanel: "border-primary/20 bg-primary/[0.06] text-primary",
} as const;

export const plannerPlanCard = {
  proCurrentBorder: "border-[hsl(42_48%_52%/0.45)] ring-1 ring-[hsl(42_48%_52%/0.22)]",
  freeCurrentBorder: "border-primary ring-1 ring-primary/20",
  defaultBorder: "border-[#DFE1E6]",
  currentBadgePro: plannerLozenge.accent,
  currentBadgeFree: plannerLozenge.primary,
  proIconWell: plannerSurface.iconWellAccent,
  freeIconWell: "bg-muted/60 text-muted-foreground",
  activeSubscription:
    "border-[hsl(42_48%_52%/0.28)] bg-[hsl(42_48%_52%/0.12)] text-[hsl(42_42%_35%)]",
  featureIconPro: "text-[hsl(42_42%_38%)]",
  featureIconFree: "text-primary",
} as const;
