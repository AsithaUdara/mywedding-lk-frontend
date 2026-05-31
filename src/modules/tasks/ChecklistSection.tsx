"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { getTasksForEvent, type Task } from "@/shared/lib/api/tasks";
import { useRealTime } from "@/shared/context/RealTimeContext";
import { CheckSquare, PlusCircle } from "lucide-react";
import { useEventPermission } from "@/shared/hooks/useEventPermission";
import { ViewerReadOnlyNotice } from "@/shared/components/ui/ViewerReadOnlyNotice";
import LoadingSkeleton from "@/shared/components/ui/LoadingSkeleton";
import TaskItem from "./TaskItem";
import CreateTaskForm from "./CreateTaskForm";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

interface ChecklistSectionProps {
  eventId: string;
}

const ChecklistSection = ({ eventId }: ChecklistSectionProps) => {
  const { user } = useAuth();
  const { checklistVersion } = useRealTime();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isViewer } = useEventPermission(eventId);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const token = await user.getIdToken();
      const data = await getTasksForEvent(token, eventId);
      data.sort((a, b) => (a.status === "Completed" ? 1 : -1) - (b.status === "Completed" ? 1 : -1));
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, eventId]);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks, checklistVersion]);

  const handleTaskCreated = () => {
    setShowCreateForm(false);
  };

  const completedCount = tasks.filter((t) => t.status === "Completed").length;
  const progressPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <section className={rf.panel}>
      <div className={cn("flex flex-col justify-between gap-4 sm:flex-row sm:items-center", rf.panelHeader)}>
        <div>
          <h2 className={rf.sectionTitle}>My tasks</h2>
          <div className={cn("mt-1 flex items-center gap-2", vg.subtitle)}>
            <span>
              {completedCount} of {tasks.length} tasks completed
            </span>
            {tasks.length > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-success/10 px-2 py-0.5 text-xs font-bold text-success ring-1 ring-success/15">
                {progressPercentage}%
              </span>
            )}
          </div>
        </div>
        {!showCreateForm && !isViewer && (
          <GlassButton type="button" variant="primary" onClick={() => setShowCreateForm(true)} className="gap-2">
            <PlusCircle size={18} aria-hidden />
            Add task
          </GlassButton>
        )}
      </div>

      <div className={rf.panelBody}>
        {isViewer && <ViewerReadOnlyNotice className="mb-6" />}
        {showCreateForm && !isViewer && (
          <div className="mb-6">
            <CreateTaskForm
              eventId={eventId}
              onTaskCreated={handleTaskCreated}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl border border-white/55 bg-white/40 p-4 backdrop-blur-sm"
              >
                <LoadingSkeleton className="h-6 w-6 flex-shrink-0 rounded-full" />
                <div className="flex-grow">
                  <LoadingSkeleton className="mb-2 h-4 w-1/3" />
                  <LoadingSkeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : tasks.length === 0 && !showCreateForm ? (
          <div className="rounded-xl border border-dashed border-white/60 bg-white/25 py-12 text-center backdrop-blur-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/50 ring-1 ring-white/60">
              <CheckSquare className="text-muted-foreground" size={24} aria-hidden />
            </div>
            <h3 className="mb-2 text-lg font-medium text-foreground">No tasks yet</h3>
            <p className={cn("mx-auto mb-6 max-w-sm", vg.subtitle)}>
              {isViewer
                ? "Tasks will appear here when your planner or editors add them."
                : "Create your first task to start organizing your perfect wedding."}
            </p>
            {!isViewer && (
              <GlassButton type="button" variant="primary" onClick={() => setShowCreateForm(true)} className="gap-2">
                <PlusCircle size={18} aria-hidden />
                Add your first task
              </GlassButton>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                eventId={eventId}
                readOnly={isViewer}
                onStatusChange={fetchTasks}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ChecklistSection;
