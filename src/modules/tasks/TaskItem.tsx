"use client";

import React, { useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { type Task, updateTaskStatus } from "@/shared/lib/api/tasks";
import { postComment } from "@/shared/lib/api/feed";
import { Check } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { StatusBadge } from "@/shared/components/ui";

interface TaskItemProps {
  task: Task;
  eventId: string;
  readOnly?: boolean;
  onStatusChange: () => void;
}

const TaskItem = ({ task, eventId, readOnly = false, onStatusChange }: TaskItemProps) => {
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

      try {
        await postComment(token, eventId, `Marked task "${task.title}" as ${newStatus}`);
      } catch (feedError) {
        console.error("Failed to post to activity feed", feedError);
      }

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

  return (
    <div
      className={cn(
        "group flex flex-col gap-2 rounded-xl border border-white/55 bg-white/40 p-4 backdrop-blur-sm transition-all",
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
              "text-[15px] font-medium transition-all",
              isCompleted ? "text-muted-foreground line-through" : "text-foreground"
            )}
          >
            {task.title}
          </p>
        </div>

        <StatusBadge status={task.status} />
      </div>
      {errorMessage && (
        <p className="mt-1 pl-10 text-xs font-medium text-destructive">{errorMessage}</p>
      )}
    </div>
  );
};

export default TaskItem;
