import { taskPriorityBadgeClass } from "@/modules/planner/theme/plannerWorkspaceTheme";

export function priorityBadgeClass(priority: string): string {
  return taskPriorityBadgeClass(priority);
}

/** @deprecated Use GlassSectionCard from glass-ui */
export const glassCardClass = "rf-glass-panel vgo-glass-panel rounded-2xl p-6 md:p-8";
