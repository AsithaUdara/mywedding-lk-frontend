"use client";

import {
  Link2,
  MoreHorizontal,
} from "lucide-react";
import { useRef, useState } from "react";
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
} from "@/modules/planner/theme/plannerWorkspaceTheme";
import { cn } from "@/shared/lib/cn";

type TaskIssueCellProps = {
  task: GanttTaskView;
  taskIndex: number;
  onOpen: (taskId: string) => void;
};

export function TaskIssueCell({ task, taskIndex, onOpen }: TaskIssueCellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const taskKey = formatTaskKey(taskIndex);
  const priority = PLANNER_PRIORITY_STYLES[taskUrgency(task)];
  const PriorityIcon = priority.icon;
  const status = JIRA_STATUS[task.status];

  return (
    <div className="group/cell min-w-0 px-3 py-2">
      <div className="flex items-start justify-between gap-1">
        <button
          type="button"
          onClick={() => onOpen(task.id)}
          className="text-[11px] font-medium text-[#5E6C84] hover:text-primary hover:underline"
        >
          {taskKey}
        </button>
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            aria-label="Task actions"
            aria-expanded={menuOpen}
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((open) => !open);
            }}
            className={cn(
              "rounded p-0.5 text-[#5E6C84] opacity-0 transition-opacity hover:bg-[#EBECF0] group-hover/cell:opacity-100",
              menuOpen && "opacity-100"
            )}
          >
            <MoreHorizontal size={14} aria-hidden />
          </button>
          {menuOpen && (
            <>
              <button
                type="button"
                aria-label="Close menu"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 min-w-[120px] overflow-hidden rounded-md border border-[#DFE1E6] bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpen(task.id);
                  }}
                  className="block w-full px-3 py-1.5 text-left text-xs text-[#172B4D] hover:bg-[#EBECF0]"
                >
                  Edit issue
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onOpen(task.id)}
        className="mt-0.5 flex w-full items-start gap-1.5 text-left"
      >
        <PriorityIcon
          size={14}
          className={cn("mt-0.5 shrink-0", priority.iconClass)}
          strokeWidth={2.5}
          aria-hidden
        />
        <span className="line-clamp-2 text-[13px] font-medium leading-snug text-[#172B4D] group-hover/cell:text-primary">
          {task.title}
        </span>
      </button>

      <div className="mt-1.5 flex flex-wrap items-center gap-1">
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
        {task.isOverdue && (
          <span className={cn("inline-flex rounded px-1.5 py-px text-[10px] font-semibold", plannerBadge.overdue)}>
            Overdue
          </span>
        )}
      </div>

      {(task.dependency || task.dueDate) && (
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-[#97A0AF]">
          {task.dependency && (
            <span className="inline-flex max-w-full items-center gap-0.5 truncate">
              <Link2 size={9} className="shrink-0" aria-hidden />
              After: {task.dependency}
            </span>
          )}
          {task.dueDate && (
            <span className="tabular-nums">Due {formatDueDate(task.dueDate)}</span>
          )}
        </div>
      )}
    </div>
  );
}
