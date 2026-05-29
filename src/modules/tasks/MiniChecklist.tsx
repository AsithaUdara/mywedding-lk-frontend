"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { getTasksForEvent, type Task } from "@/shared/lib/api/tasks";
import { useRealTime } from "@/shared/context/RealTimeContext";
import { CheckSquare, ArrowRight } from "lucide-react";
import Link from "next/link";
import TaskItem from "./TaskItem";
import Skeleton from "@/shared/components/ui/Skeleton";
import { cp } from "@/modules/client/client-theme";
const MiniChecklist = ({ eventId }: { eventId: string }) => {
  const { user } = useAuth();
  const { checklistVersion } = useRealTime();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const data = await getTasksForEvent(token, eventId);
      const pendingTasks = data.filter((t) => t.status !== "Completed").slice(0, 7);
      setTasks(pendingTasks);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, eventId]);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks, checklistVersion]);

  return (
    <div className={cp.panel}>
      <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <CheckSquare className="text-primary" size={16} strokeWidth={2} aria-hidden />
          </div>
          <h2 className={cp.sectionTitle}>Next tasks</h2>
        </div>
        <Link
          href={`/events/${eventId}/checklist`}
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary transition-colors hover:text-primary/80"
        >
          View all <ArrowRight size={14} aria-hidden />
        </Link>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </>
        ) : tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 py-6 text-center">
            <p className="text-sm font-medium text-muted-foreground">No pending tasks</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskItem key={task.id} task={task} eventId={eventId} onStatusChange={fetchTasks} />
          ))
        )}
      </div>
    </div>
  );
};

export default MiniChecklist;
