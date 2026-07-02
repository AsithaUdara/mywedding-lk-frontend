"use client";

import {
  AlertCircle,
  Calendar,
  Link2,
} from "lucide-react";
import type { GanttTaskView } from "@/modules/planner/gantt/ganttTimeline";
import { formatDueDate } from "@/modules/planner/gantt/ganttTimeline";
import {
  formatTaskKey,
  JIRA_STATUS,
  taskUrgency,
} from "@/modules/planner/tasks/taskIssueUi";
import {
  PLANNER_PRIORITY_STYLES,
  plannerBadge,
  TASK_OVERDUE_RING,
} from "@/modules/planner/theme/plannerWorkspaceTheme";
import { cn } from "@/shared/lib/cn";

type TaskIssueCardProps = {
  task: GanttTaskView;
  taskIndex: number;
  onOpen: (taskId: string) => void;
  variant?: "default" | "overdue";
};

export function TaskIssueCard({
  task,
  taskIndex,
  onOpen,
  variant = "default",
}: TaskIssueCardProps) {
  const taskKey = formatTaskKey(taskIndex);
  const priority = PLANNER_PRIORITY_STYLES[taskUrgency(task)];
  const PriorityIcon = priority.icon;
  const status = JIRA_STATUS[task.status];

  return (
    <button
      type="button"
      onClick={() => onOpen(task.id)}
      className={cn(
        "group w-full rounded border border-[#DFE1E6] border-l-[3px] bg-white text-left shadow-[0_1px_1px_rgba(9,30,66,0.25)]",
        "transition-[box-shadow,background-color] duration-150",
        "hover:bg-[#FAFBFC] hover:shadow-[0_4px_8px_rgba(9,30,66,0.15)]",
        priority.border,
        variant === "overdue" && TASK_OVERDUE_RING
      )}
    >
      <div className="p-2.5">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-[#5E6C84] group-hover:text-primary group-hover:underline">
            {taskKey}
          </span>
          {variant === "overdue" && (
            <span className={cn("inline-flex items-center gap-0.5 rounded px-1.5 py-px text-[10px] font-semibold", plannerBadge.overdue)}>
              <AlertCircle size={9} aria-hidden />
              Overdue
            </span>
          )}
        </div>

        <div className="flex items-start gap-1.5">
          <PriorityIcon
            size={14}
            className={cn("mt-0.5 shrink-0", priority.iconClass)}
            strokeWidth={2.5}
            aria-hidden
          />
          <span className="line-clamp-2 text-[13px] font-medium leading-snug text-[#172B4D] group-hover:text-primary">
            {task.title}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          <span
            className={cn(
              "inline-flex rounded px-1.5 py-px text-[10px] font-semibold uppercase leading-4",
              status.className
            )}
          >
            {status.label}
          </span>
          {task.dueThisWeek && !task.isOverdue && (
            <span className={cn("inline-flex rounded px-1.5 py-px text-[10px] font-semibold", plannerBadge.dueThisWeek)}>
              Due this week
            </span>
          )}
          {task.dependency && (
            <span className="inline-flex max-w-full items-center gap-0.5 truncate rounded bg-[#F4F5F7] px-1.5 py-px text-[10px] font-medium text-[#5E6C84]">
              <Link2 size={9} className="shrink-0" aria-hidden />
              After: {task.dependency}
            </span>
          )}
        </div>

        <div className="mt-2.5 border-t border-[#EBECF0] pt-2">
          <span className="inline-flex items-center gap-1 text-[11px] text-[#5E6C84]">
            <Calendar size={12} className="shrink-0 text-[#97A0AF]" aria-hidden />
            {task.dueDate ? formatDueDate(task.dueDate) : "No due date"}
          </span>
        </div>
      </div>
    </button>
  );
}
