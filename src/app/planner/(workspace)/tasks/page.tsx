"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Link2,
  ListTodo,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { getPlannerEvents, PlannerEventListItem } from "@/shared/lib/api/planner";
import {
  generateDiscoveryTasks,
  getTasksForEvent,
  patchTaskSchedule,
  realignEventTaskSchedule,
  Task,
} from "@/shared/lib/api/tasks";
import { getEventBrief, type EventBrief } from "@/shared/lib/api/eventBrief";
import { EventBriefPanel } from "@/modules/planner/brief/EventBriefPanel";
import { ChecklistPlanWizard } from "@/modules/planner/checklist/ChecklistPlanWizard";
import { usePlannerBranding } from "@/modules/planner/branding/PlannerBrandingProvider";
import { EventPickerSelect } from "@/modules/planner/planning/EventPlanningHeader";
import { PlannerSetupFlow, type SetupStep } from "@/modules/planner/planning/PlannerSetupFlow";
import {
  buildGanttTimeline,
  checkDependencyViolation,
  countScheduleHealth,
  formatDueDate,
  formatScheduleHealthSummary,
  GanttTaskView,
  GanttTimeline,
  getWeekLabels,
  inferStage,
  mapApiTaskToGanttView,
  partitionGanttTasks,
  weeksToIsoRange,
} from "@/modules/planner/gantt/ganttTimeline";
import { ErrorBanner } from "@/modules/planner/components/ui";
import { EmptyState, PageLoadingSkeleton, inputClass } from "@/shared/components/ui";
import {
  GlassButton,
  GlassPageHeader,
  GlassSectionCard,
  GlassStatCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

const STAGE_PILL: Record<GanttTaskView["stage"], string> = {
  Onboarding: "bg-warning/10 text-warning ring-1 ring-warning/15",
  Planning: "bg-accent/10 text-accent ring-1 ring-accent/15",
  Execution: "bg-primary/10 text-primary ring-1 ring-primary/15",
};

function TaskMetaBadges({ task }: { task: GanttTaskView }) {
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
      {task.dueThisWeek && !task.isOverdue && (
        <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning ring-1 ring-warning/15">
          Due this week
        </span>
      )}
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
          STAGE_PILL[task.stage]
        )}
      >
        {task.completion}%
      </span>
      <span className={cn("inline-flex items-center gap-1", vg.caption)}>
        <Clock3 size={11} aria-hidden />
        {task.owner}
      </span>
      {task.dependency && (
        <span className={cn("inline-flex items-center gap-1", vg.caption)}>
          <Link2 size={11} aria-hidden />
          {task.dependency.toUpperCase()}
        </span>
      )}
    </div>
  );
}

export default function PlannerTasksPage() {
  const { user } = useAuth();
  const { brand } = usePlannerBranding();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventIdFromUrl = searchParams.get("eventId");
  const [events, setEvents] = useState<PlannerEventListItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [tasks, setTasks] = useState<GanttTaskView[]>([]);
  const [rawTasks, setRawTasks] = useState<Task[]>([]);
  const [timeline, setTimeline] = useState<GanttTimeline>(() => buildGanttTimeline(new Date()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dependencyWarning, setDependencyWarning] = useState<string | null>(null);
  const [realignMessage, setRealignMessage] = useState<string | null>(null);
  const [realigning, setRealigning] = useState(false);
  const [eventBrief, setEventBrief] = useState<EventBrief | null>(null);
  const [checklistMessage, setChecklistMessage] = useState<string | null>(null);
  const [setupStep, setSetupStep] = useState<SetupStep>(1);
  const [showNewEventTip, setShowNewEventTip] = useState(false);
  const [seedingDiscovery, setSeedingDiscovery] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [savingTaskId, setSavingTaskId] = useState<string | null>(null);
  const dragState = useRef<{ taskId: string; startX: number; startWeek: number } | null>(null);

  const weekCount = timeline.weekCount;

  const loadEvents = useCallback(async () => {
    if (!user) return;
    const token = await user.getIdToken();
    const plannerEvents = await getPlannerEvents(token);
    setEvents(plannerEvents);
    setSelectedEventId((current) => {
      const urlId =
        eventIdFromUrl ??
        (typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("eventId")
          : null);
      if (urlId && plannerEvents.some((e) => e.eventId === urlId)) {
        return urlId;
      }
      if (current && plannerEvents.some((e) => e.eventId === current)) {
        return current;
      }
      return plannerEvents[0]?.eventId || "";
    });
  }, [user, eventIdFromUrl]);

  const handleSelectEvent = useCallback(
    (eventId: string) => {
      setSelectedEventId(eventId);
      setSetupStep(1);
      router.replace(`/planner/tasks?eventId=${encodeURIComponent(eventId)}`, { scroll: false });
    },
    [router]
  );

  useEffect(() => {
    if (searchParams.get("welcome") !== "1" || !selectedEventId) return;
    setShowNewEventTip(true);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("welcome");
    const qs = params.toString();
    router.replace(qs ? `/planner/tasks?${qs}` : "/planner/tasks", { scroll: false });
  }, [searchParams, selectedEventId, router]);

  useEffect(() => {
    if (!user || !selectedEventId) {
      setEventBrief(null);
      return;
    }
    void (async () => {
      try {
        const token = await user.getIdToken();
        const brief = await getEventBrief(token, selectedEventId);
        setEventBrief(brief);
      } catch {
        setEventBrief(null);
      }
    })();
  }, [user, selectedEventId, checklistMessage]);

  const loadTasks = useCallback(async () => {
    if (!user || !selectedEventId) {
      setTasks([]);
      setRawTasks([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const apiTasks = await getTasksForEvent(token, selectedEventId);
      const selectedEvent = events.find((e) => e.eventId === selectedEventId);
      const nextTimeline = buildGanttTimeline(
        selectedEvent ? new Date(selectedEvent.eventDate) : new Date()
      );
      setTimeline(nextTimeline);
      setRawTasks(apiTasks);
      const idToShort = new Map(apiTasks.map((t, i) => [t.id, `t${i + 1}`]));
      setTasks(apiTasks.map((t, i) => mapApiTaskToGanttView(t, i, nextTimeline, idToShort)));
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

  const tasksById = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);
  const partition = useMemo(() => partitionGanttTasks(tasks), [tasks]);
  const scheduleHealth = useMemo(() => countScheduleHealth(rawTasks), [rawTasks]);

  const healthSummary = useMemo(
    () => formatScheduleHealthSummary(timeline, scheduleHealth.overdue, scheduleHealth.dueThisWeek),
    [timeline, scheduleHealth]
  );

  const weekLabels = useMemo(() => getWeekLabels(timeline), [timeline]);

  const completedCount = useMemo(
    () => tasks.filter((t) => t.status === "Completed").length,
    [tasks]
  );

  const activeByStage = useMemo(() => {
    const order: GanttTaskView["stage"][] = ["Onboarding", "Planning", "Execution"];
    const groups = new Map<GanttTaskView["stage"], GanttTaskView[]>(
      order.map((stage) => [stage, [] as GanttTaskView[]])
    );
    for (const task of partition.active) {
      groups.get(task.stage)!.push(task);
    }
    return order
      .map((stage) => ({ stage, items: groups.get(stage)! }))
      .filter((group) => group.items.length > 0);
  }, [partition.active]);

  const handleRealign = async () => {
    if (!user || !selectedEventId) return;
    try {
      setRealigning(true);
      setError(null);
      setRealignMessage(null);
      const token = await user.getIdToken();
      const result = await realignEventTaskSchedule(token, selectedEventId);
      setRealignMessage(`${result.message} (${result.tasksUpdated} updated)`);
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to realign schedule.");
    } finally {
      setRealigning(false);
    }
  };

  const persistTaskWeeks = async (taskId: string, startWeek: number, duration: number) => {
    if (!user || !selectedEventId) return;
    const previous = tasks;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, startWeek, duration, stage: inferStage(startWeek, weekCount) } : t
      )
    );

    const { startDate, dueDate } = weeksToIsoRange(startWeek, duration, timeline.origin);
    try {
      setSavingTaskId(taskId);
      const token = await user.getIdToken();
      await patchTaskSchedule(token, selectedEventId, taskId, { startDate, dueDate });
      setError(null);
      void loadTasks();
    } catch (err) {
      setTasks(previous);
      setError(err instanceof Error ? err.message : "Failed to save task schedule.");
    } finally {
      setSavingTaskId(null);
    }
  };

  const onBarPointerDown = (e: React.PointerEvent, task: GanttTaskView) => {
    if (savingTaskId) return;
    e.preventDefault();
    setDependencyWarning(null);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = { taskId: task.id, startX: e.clientX, startWeek: task.startWeek };
    setDraggingTaskId(task.id);
  };

  const onBarPointerMove = (e: React.PointerEvent, trackWidth: number) => {
    const state = dragState.current;
    if (!state || state.taskId !== draggingTaskId) return;
    const weekDelta = Math.round(((e.clientX - state.startX) / trackWidth) * weekCount);
    const nextStart = Math.max(0, Math.min(weekCount - 1, state.startWeek + weekDelta));
    setTasks((prev) =>
      prev.map((t) =>
        t.id === state.taskId ? { ...t, startWeek: nextStart, stage: inferStage(nextStart, weekCount) } : t
      )
    );
  };

  const onBarPointerUp = (e: React.PointerEvent, task: GanttTaskView) => {
    const state = dragState.current;
    if (!state || state.taskId !== task.id) return;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    dragState.current = null;
    setDraggingTaskId(null);

    const current = tasks.find((t) => t.id === task.id);
    if (!current) return;

    const violation = checkDependencyViolation(current, current.startWeek, tasksById, timeline);
    if (violation) {
      setDependencyWarning(violation);
      void loadTasks();
      return;
    }

    void persistTaskWeeks(task.id, current.startWeek, current.duration);
  };

  const renderGanttRow = (task: GanttTaskView) => (
    <div
      key={task.id}
      className="grid grid-cols-[minmax(220px,280px)_1fr] items-center border-b border-white/30 transition-colors last:border-b-0 hover:bg-white/45"
    >
      <div className="border-r border-white/30 px-4 py-2.5">
        <p className={cn("line-clamp-2 text-sm font-medium leading-snug", vg.body)}>{task.title}</p>
        <TaskMetaBadges task={task} />
      </div>

      <div
        className="relative mx-3 my-2 h-8 rounded-lg bg-white/55 ring-1 ring-white/60"
        style={{
          backgroundImage: `repeating-linear-gradient(to right, hsl(345 20% 50% / 0.06) 0, hsl(345 20% 50% / 0.06) 1px, transparent 1px, transparent calc(100% / ${weekCount}))`,
        }}
        onPointerMove={(e) => {
          const width = (e.currentTarget as HTMLDivElement).offsetWidth;
          onBarPointerMove(e, width);
        }}
      >
        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-primary/50"
          style={{ left: `${((weekCount - 0.5) / weekCount) * 100}%` }}
          aria-hidden
        />

        {task.isMilestone ? (
          <div
            className="absolute top-1/2 z-[1] h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-sm bg-primary shadow-sm ring-2 ring-primary/30"
            style={{ left: `${((weekCount - 0.5) / weekCount) * 100}%` }}
            title={task.title}
            aria-label={`Milestone: ${task.title}`}
          />
        ) : (
          <div
            role="slider"
            aria-label={`Reschedule ${task.title}`}
            aria-valuemin={0}
            aria-valuemax={weekCount - 1}
            aria-valuenow={task.startWeek}
            onPointerDown={(e) => onBarPointerDown(e, task)}
            onPointerUp={(e) => onBarPointerUp(e, task)}
            className={cn(
              "absolute top-1/2 flex h-6 -translate-y-1/2 cursor-grab items-center justify-end overflow-hidden rounded-md bg-primary px-2 text-[10px] font-semibold text-primary-foreground shadow-sm active:cursor-grabbing",
              (draggingTaskId === task.id || savingTaskId === task.id) &&
                "opacity-80 ring-2 ring-accent/50"
            )}
            style={{
              left: `calc(${(task.startWeek / weekCount) * 100}% + 2px)`,
              width: `calc(${(task.duration / weekCount) * 100}% - 4px)`,
              minWidth: "56px",
            }}
          >
            <span
              className="absolute inset-y-0 left-0 bg-accent/35"
              style={{ width: `${task.completion}%` }}
              aria-hidden
            />
            <span className="relative z-[1] tabular-nums">{task.completion}%</span>
          </div>
        )}
      </div>
    </div>
  );

  const selectedEvent = events.find((e) => e.eventId === selectedEventId);

  const needsFullChecklist =
    selectedEvent?.taskPlanPhase === "Discovery" ||
    (selectedEvent?.taskPlanPhase === "None" && tasks.length > 0 && tasks.length < 35);

  const isDiscoveryPhase = needsFullChecklist && selectedEvent?.taskPlanPhase !== "Full";

  useEffect(() => {
    if (!isDiscoveryPhase) return;
    setSetupStep(eventBrief?.isBriefComplete ? 3 : 1);
  }, [selectedEventId, eventBrief?.isBriefComplete, isDiscoveryPhase]);

  const handleSeedDiscoveryTasks = async () => {
    if (!user || !selectedEventId) return;
    try {
      setSeedingDiscovery(true);
      setError(null);
      const token = await user.getIdToken();
      const result = await generateDiscoveryTasks(token, selectedEventId);
      setChecklistMessage(result.message);
      setEvents((prev) =>
        prev.map((ev) =>
          ev.eventId === selectedEventId
            ? { ...ev, taskPlanPhase: "Discovery", eventLifecycleStage: "Onboarding" }
            : ev
        )
      );
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate discovery tasks.");
    } finally {
      setSeedingDiscovery(false);
    }
  };

  const handleChecklistApplied = useCallback(async () => {
    setChecklistMessage("Master checklist applied. Refreshing timeline…");
    setEvents((prev) =>
      prev.map((ev) =>
        ev.eventId === selectedEventId
          ? { ...ev, taskPlanPhase: "Full", eventLifecycleStage: "Planning" }
          : ev
      )
    );
    await loadTasks();
    await loadEvents();
  }, [selectedEventId, loadTasks, loadEvents]);

  const timelineWorkspace = (
    <>
      {partition.catchUp.length > 0 && (
        <GlassSectionCard
          title="Catch-up queue"
          subtitle="Overdue tasks — complete them or click Realign schedule to spread remaining work from today forward"
        >
          <ul className="divide-y divide-white/40 rounded-xl border border-destructive/15 bg-destructive/[0.02]">
            {partition.catchUp.map((task) => (
              <li
                key={task.id}
                className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-medium", vg.body)}>{task.title}</p>
                  <TaskMetaBadges task={task} />
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-destructive ring-1 ring-destructive/20">
                    <AlertTriangle size={10} aria-hidden />
                    Overdue
                  </span>
                  <p className={cn("mt-1 tabular-nums", vg.caption)}>
                    Due {formatDueDate(task.dueDate)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </GlassSectionCard>
      )}

      <GlassSectionCard
        title={isDiscoveryPhase ? "Starter tasks" : "Your timeline"}
        subtitle={
          isDiscoveryPhase
            ? "Complete these first — drag bars to change dates"
            : "Today → wedding day · drag bars to reschedule"
        }
        action={
          savingTaskId ? (
            <span className={cn("inline-flex items-center gap-1.5", vg.caption)}>
              <Clock3 size={14} className="animate-pulse" aria-hidden />
              Saving…
            </span>
          ) : (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-white/55 bg-white/40 px-3 py-1 backdrop-blur-sm",
                vg.caption
              )}
            >
              <CalendarRange size={14} aria-hidden />
              {partition.active.length} active · {weekCount} weeks
            </span>
          )
        }
      >
        {tasks.length === 0 && !loading ? (
          <EmptyState
            title="No discovery tasks yet"
            description="New events receive 8 discovery tasks automatically when created. If this event is missing them, generate them now."
            action={
              selectedEventId ? (
                <GlassButton
                  type="button"
                  variant="primary"
                  disabled={seedingDiscovery}
                  onClick={() => void handleSeedDiscoveryTasks()}
                >
                  {seedingDiscovery ? "Generating…" : "Generate 8 discovery tasks"}
                </GlassButton>
              ) : undefined
            }
            className="border-0 bg-transparent shadow-none"
          />
        ) : partition.active.length === 0 ? (
          <EmptyState
            title="No active tasks on the chart"
            description={
              partition.catchUp.length > 0
                ? "All open tasks are overdue. Use Realign schedule or mark tasks complete."
                : "All tasks are completed."
            }
            className="border-0 bg-transparent shadow-none"
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/55 bg-white/30">
            <div className="max-h-[min(60vh,640px)] overflow-auto">
              <div className="min-w-[760px]">
                <div className="sticky top-0 z-20 grid grid-cols-[minmax(220px,280px)_1fr] border-b border-white/50 bg-white/90 backdrop-blur-sm">
                  <div className={cn("px-4 py-3", vg.label)}>Task</div>
                  <div className="relative border-l border-white/40 px-3 py-3">
                    <div className="relative h-6 min-w-0">
                      {weekLabels.map((week) =>
                        week.label ? (
                          <span
                            key={week.index}
                            className={cn(
                              "absolute whitespace-nowrap tabular-nums",
                              vg.caption,
                              week.isWedding
                                ? "right-0 translate-x-0 font-bold text-primary"
                                : "-translate-x-1/2 font-semibold text-muted-foreground"
                            )}
                            style={
                              week.isWedding
                                ? undefined
                                : { left: `${((week.index + 0.5) / weekCount) * 100}%` }
                            }
                          >
                            {week.label}
                          </span>
                        ) : null
                      )}
                    </div>
                  </div>
                </div>

                {activeByStage.map((group) => (
                  <div key={group.stage}>
                    <div
                      className={cn(
                        "sticky top-[49px] z-10 border-b border-white/40 bg-white/80 px-4 py-2 backdrop-blur-sm",
                        vg.caption,
                        "font-semibold uppercase tracking-wide text-muted-foreground"
                      )}
                    >
                      {group.stage}
                      <span className="ml-2 font-normal normal-case text-muted-foreground/80">
                        ({group.items.length})
                      </span>
                    </div>
                    {group.items.map((task) => renderGanttRow(task))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </GlassSectionCard>

      {partition.completed.length > 0 && (
        <GlassSectionCard
          title="Completed"
          subtitle={`${partition.completed.length} tasks done`}
          action={
            <button
              type="button"
              onClick={() => setShowCompleted((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border border-white/55 bg-white/40 px-3 py-1 text-xs font-semibold backdrop-blur-sm",
                vg.caption
              )}
            >
              {showCompleted ? (
                <ChevronDown size={14} aria-hidden />
              ) : (
                <ChevronRight size={14} aria-hidden />
              )}
              {showCompleted ? "Hide" : "Show"}
            </button>
          }
        >
          {showCompleted && (
            <ul className="divide-y divide-white/40 rounded-xl border border-white/55 bg-white/25">
              {partition.completed.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 opacity-75"
                >
                  <span className={cn("text-sm line-through decoration-muted-foreground/50", vg.body)}>
                    {task.title}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                    <CheckCircle2 size={14} aria-hidden />
                    Done
                  </span>
                </li>
              ))}
            </ul>
          )}
        </GlassSectionCard>
      )}
    </>
  );

  if (loading && tasks.length === 0 && events.length === 0) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-6 pb-4 md:space-y-8">
      {error && <ErrorBanner message={error} />}
      {dependencyWarning && (
        <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          <span className="inline-flex items-center gap-2 font-medium">
            <AlertTriangle size={16} aria-hidden />
            Dependency conflict
          </span>
          <p className="mt-1 text-warning/90">{dependencyWarning}</p>
        </div>
      )}
      {realignMessage && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
          {realignMessage}
        </div>
      )}
      {checklistMessage && (
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950">
          {checklistMessage}
        </div>
      )}

      {events.length > 0 && selectedEvent && (
        <GlassPageHeader
          title={isDiscoveryPhase ? "Set up this wedding" : "Timeline"}
          description={
            isDiscoveryPhase
              ? `${selectedEvent.eventName} · wedding ${timeline.weddingDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} · follow the 3 steps below`
              : `${selectedEvent.eventName} · wedding ${timeline.weddingDate.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}`
          }
          badge="Timeline"
          action={
            <div className="flex flex-wrap items-center gap-2">
              <EventPickerSelect
                events={events}
                selectedEventId={selectedEventId}
                onSelectEvent={handleSelectEvent}
              />
              {scheduleHealth.overdue > 0 && selectedEventId && (
                <GlassButton
                  type="button"
                  variant="primary"
                  className="gap-1.5"
                  disabled={realigning}
                  onClick={() => void handleRealign()}
                >
                  <RefreshCw size={16} className={realigning ? "animate-spin" : ""} aria-hidden />
                  {realigning ? "Realigning…" : "Realign"}
                </GlassButton>
              )}
              <GlassButton href="/planner/ai" variant="ghost" className="gap-1.5 whitespace-nowrap">
                <Sparkles size={16} aria-hidden />
                AI
              </GlassButton>
            </div>
          }
        />
      )}

      {showNewEventTip && isDiscoveryPhase && selectedEvent && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-foreground">
          <p>
            <span className="font-semibold">You&apos;re on the right page.</span>             Work through step 1 below, then continue to the couple brief and full checklist.
          </p>
          <button
            type="button"
            onClick={() => setShowNewEventTip(false)}
            className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-muted"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {selectedEvent && tasks.length > 0 && (
        <div
          className={cn(
            "inline-flex flex-wrap items-center gap-2 rounded-xl border px-4 py-2.5 text-sm",
            scheduleHealth.overdue > 0
              ? "border-destructive/25 bg-destructive/5 text-destructive"
              : "border-border/60 bg-white/40 text-foreground"
          )}
        >
          {scheduleHealth.overdue > 0 && (
            <AlertTriangle size={16} className="shrink-0" aria-hidden />
          )}
          <span className="font-medium">{healthSummary}</span>
        </div>
      )}

      {(!isDiscoveryPhase || setupStep === 1) && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <GlassStatCard
            label="Scheduled tasks"
            value={tasks.length}
            sub={`${completedCount} completed`}
            icon={ListTodo}
            iconTheme="primary"
          />
          <GlassStatCard
            label="Catch-up"
            value={partition.catchUp.length}
            sub={partition.catchUp.length > 0 ? "Overdue — use realign or complete" : "Nothing overdue"}
            icon={AlertTriangle}
            iconTheme={partition.catchUp.length > 0 ? "warning" : "success"}
          />
          <GlassStatCard
            label="Due this week"
            value={scheduleHealth.dueThisWeek}
            sub="Next 7 days"
            icon={Clock3}
            iconTheme="accent"
          />
          <GlassStatCard
            label="Days to wedding"
            value={timeline.daysToWedding}
            sub={`${weekCount}-week chart window`}
            icon={CalendarDays}
            iconTheme="primary"
          />
        </div>
      )}

      {events.length === 0 ? (
        <EmptyState
          title="No events to plan yet"
          description="Create a wedding event — we'll add 8 discovery tasks to your timeline automatically."
          action={
            <GlassButton href="/planner/dashboard#create-event-dashboard" variant="primary">
              Create event
            </GlassButton>
          }
          className={cn(rf.panel, "border-0 shadow-none")}
        />
      ) : isDiscoveryPhase && selectedEventId ? (
        <PlannerSetupFlow
          currentStep={setupStep}
          briefComplete={eventBrief?.isBriefComplete}
          checklistDone={selectedEvent?.taskPlanPhase === "Full"}
        >
          {setupStep === 1 && (
            <div className="space-y-6">
              {timelineWorkspace}
              <div className="flex justify-end border-t border-border/50 pt-4">
                <GlassButton
                  type="button"
                  variant="primary"
                  className="gap-1.5"
                  onClick={() => setSetupStep(2)}
                >
                  Continue to couple brief
                  <ArrowRight size={16} aria-hidden />
                </GlassButton>
              </div>
            </div>
          )}
          {setupStep === 2 && (
            <div className="space-y-4">
              <GlassButton
                type="button"
                variant="ghost"
                className="gap-1.5 -ml-1"
                onClick={() => setSetupStep(1)}
              >
                <ArrowLeft size={16} aria-hidden />
                Back to starter tasks
              </GlassButton>
              <EventBriefPanel
                eventId={selectedEventId}
                eventName={selectedEvent?.eventName}
                onBriefUpdated={setEventBrief}
                onMarkedComplete={() => setSetupStep(3)}
                onContinue={() => setSetupStep(3)}
                embedded
              />
            </div>
          )}
          {setupStep === 3 && (
            <div className="space-y-4">
              <GlassButton
                type="button"
                variant="ghost"
                className="gap-1.5 -ml-1"
                onClick={() => setSetupStep(2)}
              >
                <ArrowLeft size={16} aria-hidden />
                Back to couple brief
              </GlassButton>
              <ChecklistPlanWizard
                eventId={selectedEventId}
                eventName={selectedEvent?.eventName}
                taskPlanPhase={selectedEvent?.taskPlanPhase ?? eventBrief?.taskPlanPhase}
                isPlannerPro={brand?.isPro ?? false}
                onApplied={() => void handleChecklistApplied()}
              />
            </div>
          )}
        </PlannerSetupFlow>
      ) : (
        timelineWorkspace
      )}
    </div>
  );
}
