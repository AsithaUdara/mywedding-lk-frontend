"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Clock3, Link2, Sparkles } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { getPlannerEvents, PlannerEventListItem } from "@/shared/lib/api/planner";
import { getTasksForEvent, patchTaskSchedule, Task } from "@/shared/lib/api/tasks";
import { ErrorBanner, LoadingState } from "@/modules/planner/components/ui";

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

const stageStyle: Record<GanttTask["stage"], string> = {
  Onboarding: "bg-fuchsia-100 text-fuchsia-700",
  Planning: "bg-orange-100 text-orange-700",
  Execution: "bg-emerald-100 text-emerald-700",
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

function weekSpanFromDates(start: Date | null, due: Date | null, origin: Date, index: number): { startWeek: number; duration: number } {
  if (start && due) {
    const startWeek = dateToWeekIndex(start, origin);
    const endWeek = dateToWeekIndex(due, origin);
    return { startWeek, duration: Math.max(1, endWeek - startWeek + 1) };
  }
  const startWeek = Math.min(index * 2, WEEKS - 2);
  return { startWeek, duration: 2 };
}

function weeksToIsoRange(startWeek: number, duration: number, origin: Date): { startDate: string; dueDate: string } {
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

function mapApiTask(task: Task, index: number, origin: Date, idToShort: Map<string, string>): GanttTask {
  const start = task.startDate ? new Date(task.startDate) : null;
  const due = task.dueDate ? new Date(task.dueDate) : null;
  const { startWeek, duration } = weekSpanFromDates(start, due, origin, index);
  const dependency = task.dependsOnTaskId ? idToShort.get(task.dependsOnTaskId) : undefined;
  return {
    id: task.id,
    title: task.title,
    owner: task.assignedToUserId ? task.assignedToUserId.slice(0, 8) : "Unassigned",
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

  const persistTaskWeeks = async (taskId: string, startWeek: number, duration: number) => {
    if (!user || !selectedEventId) return;
    const previous = tasks;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, startWeek, duration, stage: inferStage(startWeek) }
          : t
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

  if (loading && tasks.length === 0 && events.length === 0) {
    return <LoadingState label="Loading timeline…" />;
  }

  return (
    <section className="space-y-6">
      {error && <ErrorBanner message={error} />}

      <header className="rounded-[1.5rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Timeline Workspace</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Master Gantt</h1>
            <p className="mt-1 text-sm text-slate-500">
              Drag task bars horizontally to reschedule. Changes save to the database automatically.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {events.length > 0 && (
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700"
              >
                {events.map((ev) => (
                  <option key={ev.eventId} value={ev.eventId}>
                    {ev.eventName}
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-black"
            >
              <Sparkles size={16} />
              Auto-Schedule Timeline
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <article className="col-span-12 rounded-[1.5rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:col-span-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Critical Tasks</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{tasks.length}</p>
        </article>
        <article className="col-span-12 rounded-[1.5rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:col-span-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Completion</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{totalProgress}%</p>
        </article>
        <article className="col-span-12 rounded-[1.5rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:col-span-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Window</p>
          <p className="mt-2 inline-flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <CalendarDays size={18} className="text-slate-400" />
            16 Weeks
          </p>
        </article>
      </div>

      {events.length === 0 ? (
        <div className="rounded-[1.5rem] bg-white p-8 text-center text-sm text-slate-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          Create a planner event to manage tasks on the timeline.
        </div>
      ) : (
        <div className="overflow-hidden rounded-[1.5rem] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <div className="min-w-[1100px]">
              <div className="grid grid-cols-[320px_repeat(16,minmax(52px,1fr))] border-b border-slate-200/70 bg-slate-50/70 px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Task / Owner</div>
                {WEEKS_LABELS.map((week) => (
                  <div key={week} className="text-center text-[11px] font-semibold text-slate-500">
                    {week}
                  </div>
                ))}
              </div>

              <div className="space-y-2 p-4">
                {tasks.length === 0 && !loading && (
                  <p className="py-8 text-center text-sm text-slate-500">No tasks yet for this event.</p>
                )}
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="grid grid-cols-[320px_repeat(16,minmax(52px,1fr))] items-center gap-y-2 rounded-2xl border border-slate-100 p-3"
                  >
                    <div className="pr-4">
                      <p className="text-sm font-semibold tracking-tight text-slate-900">{task.title}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${stageStyle[task.stage]}`}>
                          {task.stage}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                          <Clock3 size={12} />
                          {task.owner}
                        </span>
                        {task.dependency && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                            <Link2 size={12} />
                            Depends on {task.dependency.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className="col-span-16 relative h-9 rounded-full bg-slate-100"
                      onPointerMove={(e) => {
                        const width = (e.currentTarget as HTMLDivElement).offsetWidth;
                        onBarPointerMove(e, width);
                      }}
                    >
                      <div
                        role="slider"
                        aria-label={`Reschedule ${task.title}`}
                        onPointerDown={(e) => onBarPointerDown(e, task)}
                        onPointerUp={(e) => {
                          const width = (e.currentTarget.parentElement as HTMLDivElement).offsetWidth;
                          onBarPointerUp(e, task, width);
                        }}
                        className={`absolute top-1/2 h-7 -translate-y-1/2 cursor-grab rounded-full bg-[#111111] px-3 text-[11px] font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] active:cursor-grabbing ${
                          savingTaskId === task.id ? "opacity-60" : ""
                        }`}
                        style={{
                          left: `calc(${(task.startWeek / WEEKS) * 100}% + 4px)`,
                          width: `calc(${(task.duration / WEEKS) * 100}% - 8px)`,
                          minWidth: "84px",
                        }}
                      >
                        <div className="flex h-full items-center justify-between gap-2">
                          <span className="truncate">{task.title.slice(0, 12)}</span>
                          <span className="text-white/80">{task.completion}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
