"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Clock3,
  Link2,
  ListTodo,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { getPlannerEvents, PlannerEventListItem } from "@/shared/lib/api/planner";
import { getTasksForEvent, patchTaskSchedule, Task } from "@/shared/lib/api/tasks";
import { ErrorBanner } from "@/modules/planner/components/ui";
import {
  Badge,
  Button,
  EmptyState,
  PageHeader,
  PageLoadingSkeleton,
  SectionCard,
  StatCard,
  inputClass,
} from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";

const WEEKS = 16;
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

type GanttTask = {
  id: string;
  title: string;
  owner: string;
  stage: "Onboarding" | "Planning" | "Execution";
  startWeek: number;
  duration: number;
  completion: number;
  dependency?: string;
};

const WEEKS_LABELS = Array.from({ length: WEEKS }, (_, i) => `W${i + 1}`);

const stageBadgeVariant: Record<GanttTask["stage"], "accent" | "default" | "muted"> = {
  Onboarding: "accent",
  Planning: "default",
  Execution: "muted",
};

function getTimelineOrigin(eventDate: Date): Date {
  const origin = new Date(eventDate);
  origin.setDate(origin.getDate() - WEEKS * 7);
  return origin;
}

function dateToWeekIndex(date: Date, origin: Date): number {
  const idx = Math.floor((date.getTime() - origin.getTime()) / MS_PER_WEEK);
  return Math.max(0, Math.min(WEEKS - 1, idx));
}

function weekSpanFromDates(
  start: Date | null,
  due: Date | null,
  origin: Date,
  index: number
): { startWeek: number; duration: number } {
  if (start && due) {
    const startWeek = dateToWeekIndex(start, origin);
    const endWeek = dateToWeekIndex(due, origin);
    return { startWeek, duration: Math.max(1, endWeek - startWeek + 1) };
  }
  const startWeek = Math.min(index * 2, WEEKS - 2);
  return { startWeek, duration: 2 };
}

function weeksToIsoRange(
  startWeek: number,
  duration: number,
  origin: Date
): { startDate: string; dueDate: string } {
  const start = new Date(origin.getTime() + startWeek * MS_PER_WEEK);
  const due = new Date(origin.getTime() + (startWeek + duration) * MS_PER_WEEK - 1);
  return { startDate: start.toISOString(), dueDate: due.toISOString() };
}

function completionFromStatus(status: Task["status"]): number {
  if (status === "Completed") return 100;
  if (status === "InProgress") return 50;
  return 15;
}

function inferStage(startWeek: number): GanttTask["stage"] {
  if (startWeek < 4) return "Onboarding";
  if (startWeek < 10) return "Planning";
  return "Execution";
}

function mapApiTask(
  task: Task,
  index: number,
  origin: Date,
  idToShort: Map<string, string>
): GanttTask {
  const start = task.startDate ? new Date(task.startDate) : null;
  const due = task.dueDate ? new Date(task.dueDate) : null;
  const { startWeek, duration } = weekSpanFromDates(start, due, origin, index);
  const dependency = task.dependsOnTaskId ? idToShort.get(task.dependsOnTaskId) : undefined;
  return {
    id: task.id,
    title: task.title,
    owner: task.assignedToUserId ? "Assigned" : "Unassigned",
    stage: inferStage(startWeek),
    startWeek,
    duration,
    completion: completionFromStatus(task.status),
    dependency,
  };
}

export default function PlannerTasksPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<PlannerEventListItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [timelineOrigin, setTimelineOrigin] = useState<Date>(() => getTimelineOrigin(new Date()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [savingTaskId, setSavingTaskId] = useState<string | null>(null);
  const dragState = useRef<{ taskId: string; startX: number; startWeek: number } | null>(null);

  const loadEvents = useCallback(async () => {
    if (!user) return;
    const token = await user.getIdToken();
    const plannerEvents = await getPlannerEvents(token);
    setEvents(plannerEvents);
    setSelectedEventId((current) => current || plannerEvents[0]?.eventId || "");
  }, [user]);

  const loadTasks = useCallback(async () => {
    if (!user || !selectedEventId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const apiTasks = await getTasksForEvent(token, selectedEventId);
      const selectedEvent = events.find((e) => e.eventId === selectedEventId);
      const origin = getTimelineOrigin(
        selectedEvent ? new Date(selectedEvent.eventDate) : new Date()
      );
      setTimelineOrigin(origin);
      const idToShort = new Map(apiTasks.map((t, i) => [t.id, `t${i + 1}`]));
      setTasks(apiTasks.map((t, i) => mapApiTask(t, i, origin, idToShort)));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }, [user, selectedEventId, events]);

  useEffect(() => {
    void loadEvents().catch((err) => {
      setError(err instanceof Error ? err.message : "Failed to load events.");
      setLoading(false);
    });
  }, [loadEvents]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const totalProgress = useMemo(() => {
    if (tasks.length === 0) return 0;
    return Math.round(tasks.reduce((sum, task) => sum + task.completion, 0) / tasks.length);
  }, [tasks]);

  const criticalCount = useMemo(
    () => tasks.filter((t) => t.completion < 100 && t.stage === "Execution").length,
    [tasks]
  );

  const persistTaskWeeks = async (taskId: string, startWeek: number, duration: number) => {
    if (!user || !selectedEventId) return;
    const previous = tasks;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, startWeek, duration, stage: inferStage(startWeek) } : t
      )
    );

    const { startDate, dueDate } = weeksToIsoRange(startWeek, duration, timelineOrigin);
    try {
      setSavingTaskId(taskId);
      const token = await user.getIdToken();
      await patchTaskSchedule(token, selectedEventId, taskId, { startDate, dueDate });
      setError(null);
    } catch (err) {
      setTasks(previous);
      setError(err instanceof Error ? err.message : "Failed to save task schedule.");
    } finally {
      setSavingTaskId(null);
    }
  };

  const onBarPointerDown = (e: React.PointerEvent, task: GanttTask) => {
    if (savingTaskId) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = { taskId: task.id, startX: e.clientX, startWeek: task.startWeek };
    setDraggingTaskId(task.id);
  };

  const onBarPointerMove = (e: React.PointerEvent, trackWidth: number) => {
    const state = dragState.current;
    if (!state || state.taskId !== draggingTaskId) return;
    const weekDelta = Math.round(((e.clientX - state.startX) / trackWidth) * WEEKS);
    const nextStart = Math.max(0, Math.min(WEEKS - 1, state.startWeek + weekDelta));
    setTasks((prev) =>
      prev.map((t) =>
        t.id === state.taskId ? { ...t, startWeek: nextStart, stage: inferStage(nextStart) } : t
      )
    );
  };

  const onBarPointerUp = (e: React.PointerEvent, task: GanttTask, trackWidth: number) => {
    const state = dragState.current;
    if (!state || state.taskId !== task.id) return;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    dragState.current = null;
    setDraggingTaskId(null);
    const current = tasks.find((t) => t.id === task.id);
    if (current) {
      void persistTaskWeeks(task.id, current.startWeek, current.duration);
    }
  };

  const selectedEvent = events.find((e) => e.eventId === selectedEventId);

  if (loading && tasks.length === 0 && events.length === 0) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-8 pb-4">
      {error && <ErrorBanner message={error} />}

      <PageHeader
        title="Master Gantt"
        description="Drag task bars horizontally to reschedule. Changes save automatically to your event timeline."
        badge="Timeline"
        action={
          <div className="flex flex-wrap items-center gap-2">
            {events.length > 0 && (
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className={cn(inputClass, "w-auto min-w-[12rem] rounded-full py-2")}
                aria-label="Select wedding event"
              >
                {events.map((ev) => (
                  <option key={ev.eventId} value={ev.eventId}>
                    {ev.eventName}
                  </option>
                ))}
              </select>
            )}
            <Button
              href="/planner/ai"
              variant="secondary"
              size="sm"
              className="whitespace-nowrap"
            >
              <Sparkles size={16} aria-hidden />
              Auto-schedule
            </Button>
          </div>
        }
      />

      {selectedEvent && (
        <p className="-mt-4 text-sm text-muted-foreground">
          Planning window for{" "}
          <span className="font-semibold text-foreground">{selectedEvent.eventName}</span>
          {" · "}
          wedding{" "}
          {new Date(selectedEvent.eventDate).toLocaleDateString(undefined, {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Scheduled tasks"
          value={tasks.length}
          sub={
            criticalCount > 0 ? `${criticalCount} in execution phase` : undefined
          }
          icon={ListTodo}
          iconTheme="primary"
          index={0}
        />
        <StatCard
          label="Completion"
          value={`${totalProgress}%`}
          icon={CheckCircle2}
          iconTheme="success"
          index={1}
        />
        <StatCard
          label="Planning window"
          value="16 weeks"
          icon={CalendarDays}
          iconTheme="accent"
          index={2}
        />
      </div>

      {events.length === 0 ? (
        <EmptyState
          title="No events to plan yet"
          description="Create a wedding event first, then add tasks to build your master timeline."
          action={
            <Button href="/planner/events" size="sm">
              Create event
            </Button>
          }
        />
      ) : (
        <SectionCard
          title="Task timeline"
          subtitle="16-week horizon · drag bars to shift start dates"
          action={
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              <CalendarRange size={14} aria-hidden />
              {WEEKS} columns
            </span>
          }
        >
          {tasks.length === 0 && !loading ? (
            <EmptyState
              title="No tasks for this event"
              description="Add tasks from the client event hub, then return here to schedule them on the Gantt."
              className="border-0 bg-transparent shadow-none"
            />
          ) : (
            <div className="-mx-2 overflow-x-auto">
              <div className="min-w-[1100px] px-2">
                <div className="grid grid-cols-[minmax(240px,320px)_repeat(16,minmax(48px,1fr))] border-b border-border bg-muted/50 px-3 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Task / owner
                  </div>
                  {WEEKS_LABELS.map((week) => (
                    <div
                      key={week}
                      className="text-center text-[10px] font-semibold tabular-nums text-muted-foreground"
                    >
                      {week}
                    </div>
                  ))}
                </div>

                <div className="space-y-2 py-4">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="grid grid-cols-[minmax(240px,320px)_repeat(16,minmax(48px,1fr))] items-center gap-y-2 rounded-2xl border border-border bg-background/80 p-3 transition-colors hover:border-primary/20"
                    >
                      <div className="pr-3">
                        <p className="text-sm font-semibold text-foreground">{task.title}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge variant={stageBadgeVariant[task.stage]}>{task.stage}</Badge>
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Clock3 size={12} aria-hidden />
                            {task.owner}
                          </span>
                          {task.dependency && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Link2 size={12} aria-hidden />
                              {task.dependency.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className="relative col-span-16 h-9 rounded-full bg-muted"
                        onPointerMove={(e) => {
                          const width = (e.currentTarget as HTMLDivElement).offsetWidth;
                          onBarPointerMove(e, width);
                        }}
                      >
                        <div
                          role="slider"
                          aria-label={`Reschedule ${task.title}`}
                          aria-valuemin={0}
                          aria-valuemax={WEEKS - 1}
                          aria-valuenow={task.startWeek}
                          onPointerDown={(e) => onBarPointerDown(e, task)}
                          onPointerUp={(e) => {
                            const width = (e.currentTarget.parentElement as HTMLDivElement)
                              .offsetWidth;
                            onBarPointerUp(e, task, width);
                          }}
                          className={cn(
                            "absolute top-1/2 flex h-7 -translate-y-1/2 cursor-grab items-center justify-between gap-2 overflow-hidden rounded-full bg-primary px-3 text-[11px] font-semibold text-primary-foreground shadow-md shadow-primary/25 active:cursor-grabbing",
                            (draggingTaskId === task.id || savingTaskId === task.id) &&
                              "opacity-70 ring-2 ring-accent/50"
                          )}
                          style={{
                            left: `calc(${(task.startWeek / WEEKS) * 100}% + 4px)`,
                            width: `calc(${(task.duration / WEEKS) * 100}% - 8px)`,
                            minWidth: "84px",
                          }}
                        >
                          <span
                            className="absolute inset-y-0 left-0 bg-accent/35"
                            style={{ width: `${task.completion}%` }}
                            aria-hidden
                          />
                          <span className="relative z-[1] truncate">{task.title.slice(0, 14)}</span>
                          <span className="relative z-[1] tabular-nums text-primary-foreground/90">
                            {task.completion}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}
