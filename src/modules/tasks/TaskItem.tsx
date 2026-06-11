"use client";

import React, { useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { type Task, updateTaskStatus } from "@/shared/lib/api/tasks";
import { Check } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/components/ui";
import { formatTaskDueDate, taskStatusLabel } from "@/modules/tasks/taskDisplay";

interface TaskItemProps {
  task: Task;
  readOnly?: boolean;
  compact?: boolean;
  onStatusChange: () => void;
}

const TaskItem = ({ task, readOnly = false, compact = false, onStatusChange }: TaskItemProps) => {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCheckboxChange = async () => {
    if (!user || isUpdating || readOnly) return;
    setIsUpdating(true);
    setErrorMessage(null);

    try {
      const token = await user.getIdToken();
      const newStatus = task.status === "Completed" ? "ToDo" : "Completed";
      await updateTaskStatus(token, task.id, newStatus);
      onStatusChange();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to update task right now. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const isCompleted = task.status === "Completed";
  const dueMeta = formatTaskDueDate(task.dueDate);

  return (
    <div
      className={cn(
        "group flex flex-col gap-2 rounded-xl border border-white/55 bg-white/40 backdrop-blur-sm transition-all",
        compact ? "p-3" : "p-4",
        isCompleted
          ? "opacity-75"
          : "hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/55 hover:shadow-[0_4px_16px_hsl(345_100%_25%/0.06)]"
      )}
    >
      <div className="flex items-center gap-4">
        {readOnly ? (
          <div
            className={cn(
              "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2",
              isCompleted ? "border-primary/40 bg-primary/20" : "border-white/60 bg-white/50"
            )}
            aria-hidden
          >
            {isCompleted && <Check size={14} strokeWidth={3} className="text-primary" />}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => void handleCheckboxChange()}
            disabled={isUpdating}
            className={cn(
              "flex h-6 w-6 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border-2 transition-all",
              isCompleted
                ? "scale-95 border-primary bg-primary"
                : "border-white/60 bg-white/50 hover:border-primary group-hover:scale-105",
              isUpdating && "cursor-wait opacity-50"
            )}
            aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
          >
            {isCompleted && <Check size={14} strokeWidth={3} className="text-primary-foreground" />}
          </button>
        )}

        <div className="min-w-0 flex-grow">
          <p
            className={cn(
              "font-medium transition-all",
              compact ? "text-sm leading-snug" : "text-[15px]",
              isCompleted ? "text-muted-foreground line-through" : "text-foreground"
            )}
          >
            {task.title}
          </p>
          {dueMeta ? (
            <p
              className={cn(
                "mt-0.5 text-xs font-medium",
                dueMeta.tone === "overdue"
                  ? "text-destructive"
                  : dueMeta.tone === "soon"
                  ? "text-amber-700"
                  : "text-muted-foreground"
              )}
            >
              {dueMeta.label}
            </p>
          ) : null}
        </div>

        <Badge variant="status" status={task.status} className="shrink-0">
          {taskStatusLabel(task.status)}
        </Badge>
      </div>
      {errorMessage && (
        <p className="mt-1 pl-10 text-xs font-medium text-destructive">{errorMessage}</p>
      )}
    </div>
  );
};

export default TaskItem;
