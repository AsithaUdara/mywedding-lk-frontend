import type { GanttTaskView } from "@/modules/planner/gantt/ganttTimeline";
import type { PipelinePriority } from "@/modules/planner/clients/plannerClientHelpers";
import { PLANNER_TASK_STATUS } from "@/modules/planner/theme/plannerWorkspaceTheme";

export function formatTaskKey(index: number): string {
  return `TSK-${String(index + 1).padStart(3, "0")}`;
}

export { PLANNER_TASK_STATUS, JIRA_STATUS } from "@/modules/planner/theme/plannerWorkspaceTheme";

export function taskUrgency(task: GanttTaskView): PipelinePriority {
  if (task.isOverdue) return "Urgent";
  if (task.dueThisWeek) return "High";
  if (task.dueDate) {
    const due = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const days = Math.ceil((due.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
    if (days <= 30) return "Medium";
  }
  return "Low";
}

// Kept for any legacy imports — prefer PLANNER_TASK_STATUS from theme.
export const TASK_STATUS = PLANNER_TASK_STATUS;
