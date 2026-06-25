"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { getTasksForEvent, type Task } from "@/shared/lib/api/tasks";
import { useRealTime } from "@/shared/context/RealTimeContext";
import { CheckSquare, ChevronDown, ListTodo, PlusCircle, TrendingUp, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useEventPermission } from "@/shared/hooks/useEventPermission";
import { ViewerReadOnlyNotice } from "@/shared/components/ui/ViewerReadOnlyNotice";
import LoadingSkeleton from "@/shared/components/ui/LoadingSkeleton";
import TaskItem from "./TaskItem";
import CreateTaskForm from "./CreateTaskForm";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";
import {
  filterTasks,
  sortTasksForDisplay,
  type TaskFilter,
} from "@/modules/tasks/taskDisplay";

interface ChecklistSectionProps {
  eventId: string;
}

const FILTER_OPTIONS: { id: TaskFilter; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "all", label: "All" },
  { id: "completed", label: "Completed" },
];

const ChecklistSection = ({ eventId }: ChecklistSectionProps) => {
  const { user } = useAuth();
  const { checklistVersion } = useRealTime();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isViewer } = useEventPermission(eventId);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState<TaskFilter>("active");
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [isPlanner, setIsPlanner] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsPlanner(false);
      return;
    }
    void user.getIdTokenResult().then((result) => {
      setIsPlanner(result.claims.role === "planner");
    });
  }, [user]);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const token = await user.getIdToken();
      const data = await getTasksForEvent(token, eventId);
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
    void fetchTasks();
  };

  const completedCount = tasks.filter((t) => t.status === "Completed").length;
  const activeCount = tasks.length - completedCount;
  const todoCount = tasks.filter((t) => t.status === "ToDo").length;
  const inProgressCount = tasks.filter((t) => t.status === "InProgress").length;
  const progressPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const filteredTasks = useMemo(
    () => sortTasksForDisplay(filterTasks(tasks, filter)),
    [tasks, filter]
  );

  const showGroupedCompleted =
    filter === "all" && completedCount > 0 && activeCount > 0;
  const activeList = showGroupedCompleted
    ? sortTasksForDisplay(tasks.filter((t) => t.status !== "Completed"))
    : filteredTasks;
  const completedList = sortTasksForDisplay(tasks.filter((t) => t.status === "Completed"));

  return (
    <div className="space-y-3">
      {isPlanner && (
        <GlassButton
          href={`/planner/tasks?eventId=${encodeURIComponent(eventId)}`}
          variant="ghost"
          className="gap-1.5 -ml-1"
        >
          <ArrowLeft size={16} aria-hidden />
          Back to timeline
        </GlassButton>
      )}

      <section className={rf.panel}>
      <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", rf.panelHeader)}>
        <div className="min-w-0 flex-1">
          <h2 className={rf.sectionTitle}>My tasks</h2>
          <p className={cn("mt-1", vg.subtitle)}>
            Track and complete everything for your celebration
          </p>
        </div>
        {!showCreateForm && !isViewer && (
          <GlassButton
            type="button"
            variant="primary"
            onClick={() => setShowCreateForm(true)}
            className="shrink-0 gap-2"
          >
            <PlusCircle size={18} aria-hidden />
            Add task
          </GlassButton>
        )}
      </div>

      <div className={rf.panelBody}>
        {isViewer && <ViewerReadOnlyNotice className="mb-6" />}

        {!isLoading && tasks.length > 0 ? (
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className={cn(rf.statCard, "min-h-0 py-4")}>
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", rf.iconPrimary)}>
                  <ListTodo size={18} aria-hidden />
                </div>
                <div>
                  <p className={rf.label}>Active</p>
                  <p className="mt-0.5 text-2xl font-semibold tabular-nums text-foreground">{activeCount}</p>
                  <p className={cn("mt-0.5", rf.caption)}>
                    {inProgressCount} in progress · {todoCount} to do
                  </p>
                </div>
              </div>
              <div className={cn(rf.statCard, "min-h-0 py-4")}>
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", rf.iconSuccess)}>
                  <CheckSquare size={18} aria-hidden />
                </div>
                <div>
                  <p className={rf.label}>Completed</p>
                  <p className="mt-0.5 text-2xl font-semibold tabular-nums text-success">{completedCount}</p>
                  <p className={cn("mt-0.5", rf.caption)}>of {tasks.length} total</p>
                </div>
              </div>
              <div className={cn(rf.statCard, "min-h-0 py-4")}>
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", rf.iconAccent)}>
                  <TrendingUp size={18} aria-hidden />
                </div>
                <div>
                  <p className={rf.label}>Progress</p>
                  <p className="mt-0.5 text-2xl font-semibold tabular-nums text-foreground">{progressPercentage}%</p>
                  <p className={cn("mt-0.5", rf.caption)}>checklist complete</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/55 bg-white/35 p-4 backdrop-blur-sm">
              <div className="mb-2.5 flex items-end justify-between gap-3">
                <p className={rf.label}>Overall completion</p>
                <p className="text-sm font-semibold tabular-nums text-foreground">
                  {completedCount}/{tasks.length}
                </p>
              </div>
              <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-muted/60 ring-1 ring-border/30"
                role="progressbar"
                aria-valuenow={progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${progressPercentage}% of tasks completed`}
              >
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        ) : null}

        <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Filter tasks">
          {FILTER_OPTIONS.map((option) => {
            const count =
              option.id === "active"
                ? activeCount
                : option.id === "completed"
                ? completedCount
                : tasks.length;
            const selected = filter === option.id;

            return (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setFilter(option.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  selected
                    ? "border-primary/30 bg-primary text-primary-foreground shadow-sm"
                    : "border-white/60 bg-white/40 text-foreground hover:bg-white/60"
                )}
              >
                {option.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                    selected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

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
          <div className="space-y-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl border border-white/55 bg-white/40 p-3.5 backdrop-blur-sm"
              >
                <LoadingSkeleton className="h-6 w-6 flex-shrink-0 rounded-full" />
                <div className="flex-grow space-y-2">
                  <LoadingSkeleton className="h-4 w-2/3" />
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
                ? "Your planner is preparing your personalized checklist. You'll see tasks here once the master plan is published."
                : "Create your first task to start organizing your perfect wedding."}
            </p>
            {!isViewer && (
              <GlassButton type="button" variant="primary" onClick={() => setShowCreateForm(true)} className="gap-2">
                <PlusCircle size={18} aria-hidden />
                Add your first task
              </GlassButton>
            )}
          </div>
        ) : filteredTasks.length === 0 && !showGroupedCompleted ? (
          <div className="rounded-xl border border-dashed border-white/60 bg-white/25 py-10 text-center">
            <p className={cn(vg.subtitle, "font-medium")}>No tasks in this view</p>
            <p className={cn("mt-1", vg.caption)}>Try another filter to see more items.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeList.length > 0 ? (
              <div>
                {showGroupedCompleted ? (
                  <h3 className={cn("mb-3", rf.label)}>To do now ({activeList.length})</h3>
                ) : null}
                <ul className="space-y-2.5">
                  {activeList.map((task) => (
                    <li key={task.id}>
                      <TaskItem
                        task={task}
                        readOnly={isViewer}
                        compact
                        onStatusChange={fetchTasks}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {showGroupedCompleted ? (
              <div className="border-t border-white/50 pt-5">
                <button
                  type="button"
                  onClick={() => setCompletedExpanded((open) => !open)}
                  className="mb-3 flex w-full items-center justify-between gap-2 text-left"
                  aria-expanded={completedExpanded}
                >
                  <h3 className={rf.label}>
                    Completed ({completedList.length})
                  </h3>
                  <ChevronDown
                    size={18}
                    className={cn(
                      "shrink-0 text-muted-foreground transition-transform",
                      completedExpanded && "rotate-180"
                    )}
                    aria-hidden
                  />
                </button>
                {completedExpanded ? (
                  <ul className="space-y-2.5">
                    {completedList.map((task) => (
                      <li key={task.id}>
                        <TaskItem
                          task={task}
                          readOnly={isViewer}
                          compact
                          onStatusChange={fetchTasks}
                        />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
    </div>
  );
};

export default ChecklistSection;
