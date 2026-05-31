"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { getTasksForEvent, type Task } from "@/shared/lib/api/tasks";
import { useRealTime } from "@/shared/context/RealTimeContext";
import { ArrowRight } from "lucide-react";
import TaskItem from "./TaskItem";
import Skeleton from "@/shared/components/ui/Skeleton";
import { GlassButton, GlassSectionCard } from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

const MiniChecklist = ({ eventId, className }: { eventId: string; className?: string }) => {
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
    <GlassSectionCard
      className={className}
      title="Next tasks"
      subtitle="Your upcoming checklist items"
      action={
        <GlassButton href={`/events/${eventId}/checklist`} variant="ghost" className="gap-1">
          View all
          <ArrowRight size={14} aria-hidden />
        </GlassButton>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </>
        ) : tasks.length === 0 ? (
          <div className={cn("rounded-xl border border-dashed border-white/60 bg-white/25 py-6 text-center", vg.subtitle)}>
            <p className="font-medium">No pending tasks</p>
          </div>
        ) : (
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto lg:max-h-[380px]">
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} eventId={eventId} onStatusChange={fetchTasks} />
            ))}
          </div>
        )}
      </div>
    </GlassSectionCard>
  );
};

export default MiniChecklist;
