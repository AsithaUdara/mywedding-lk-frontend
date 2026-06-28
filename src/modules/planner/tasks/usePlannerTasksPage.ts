"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/shared/context/AuthContext";
import {
  createTask,
  deleteTask,
  generateDiscoveryTasks,
  generateFullChecklist,
  patchTaskSchedule,
  realignEventTaskSchedule,
  Task,
  updateTask,
} from "@/shared/lib/api/tasks";
import { type TaskFormValues } from "@/modules/planner/tasks/TaskFormModal";
import {
  applyPlannerTaskTemplate,
} from "@/shared/lib/api/plannerTaskTemplates";
import { usePlannerBranding } from "@/modules/planner/branding/PlannerBrandingProvider";
import { type SetupStep } from "@/modules/planner/planning/PlannerSetupFlow";
import {
  applyGanttDependencyLabels,
  buildGanttTimeline,
  checkDependencyViolation,
  countScheduleHealth,
  formatScheduleHealthSummary,
  GanttTaskView,
  GanttTimeline,
  getWeekLabels,
  inferStage,
  mapApiTaskToGanttView,
  partitionGanttTasks,
  sortGanttTasksForDisplay,
  weeksToIsoRange,
} from "@/modules/planner/gantt/ganttTimeline";
import {
  usePlannerEventsQuery,
  usePlannerTaskTemplatesQuery,
} from "@/shared/hooks/query/usePlannerQueries";
import { useEventBriefQuery, useEventTasksQuery } from "@/shared/hooks/query/useEventQueries";
import { usePlannerQueryInvalidation } from "@/shared/hooks/query/useQueryInvalidation";

export function usePlannerTasksPage() {
  const { user } = useAuth();
  const { brand } = usePlannerBranding();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventIdFromUrl = searchParams.get("eventId");

  const {
    data: events = [],
    isLoading: eventsLoading,
    error: eventsQueryError,
    refetch: refetchEvents,
  } = usePlannerEventsQuery();

  const [selectedEventId, setSelectedEventId] = useState("");
  const [tasks, setTasks] = useState<GanttTaskView[]>([]);
  const [timeline, setTimeline] = useState<GanttTimeline>(() => buildGanttTimeline(new Date()));
  const [error, setError] = useState<string | null>(null);
  const [dependencyWarning, setDependencyWarning] = useState<string | null>(null);
  const [realignMessage, setRealignMessage] = useState<string | null>(null);
  const [realigning, setRealigning] = useState(false);
  const [checklistMessage, setChecklistMessage] = useState<string | null>(null);
  const [setupStep, setSetupStep] = useState<SetupStep>(1);
  const [showNewEventTip, setShowNewEventTip] = useState(false);
  const [seedingDiscovery, setSeedingDiscovery] = useState(false);
  const [seedingMaster, setSeedingMaster] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [savingTaskId, setSavingTaskId] = useState<string | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState<"add" | "edit">("add");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskFormSaving, setTaskFormSaving] = useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [selectedCustomTemplateId, setSelectedCustomTemplateId] = useState("");
  const [applyingCustomTemplate, setApplyingCustomTemplate] = useState(false);
  const dragState = useRef<{ taskId: string; startX: number; startWeek: number } | null>(null);
  const ganttHeaderRef = useRef<HTMLDivElement>(null);
  const [ganttHeaderHeight, setGanttHeaderHeight] = useState(56);

  const {
    invalidateEventTasks,
    invalidateEventBrief,
    invalidatePlannerEvents,
    patchPlannerEvent,
  } = usePlannerQueryInvalidation();

  const {
    data: rawTasks = [],
    isLoading: tasksLoading,
    error: tasksQueryError,
    refetch: refetchTasks,
  } = useEventTasksQuery(selectedEventId || undefined);

  const { data: eventBrief = null } = useEventBriefQuery(selectedEventId || undefined);

  const { data: customTemplates = [] } = usePlannerTaskTemplatesQuery(
    !!user && (saveTemplateOpen || !!checklistMessage)
  );

  const weekCount = timeline.weekCount;
  const loading = eventsLoading || (!!selectedEventId && tasksLoading);

  useEffect(() => {
    if (events.length === 0) return;
    const urlId =
      eventIdFromUrl ??
      (typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("eventId")
        : null);
    setSelectedEventId((current) => {
      if (urlId && events.some((e) => e.eventId === urlId)) return urlId;
      if (current && events.some((e) => e.eventId === current)) return current;
      return events[0]?.eventId ?? "";
    });
  }, [events, eventIdFromUrl]);

  useEffect(() => {
    if (customTemplates.length > 0) {
      setSelectedCustomTemplateId((prev) => prev || customTemplates[0]?.id || "");
    }
  }, [customTemplates]);

  useEffect(() => {
    const queryError = eventsQueryError ?? tasksQueryError;
    if (queryError) {
      setError(queryError.message);
    }
  }, [eventsQueryError, tasksQueryError]);

  useEffect(() => {
    if (!selectedEventId) {
      setTasks([]);
      return;
    }
    const selectedEvent = events.find((e) => e.eventId === selectedEventId);
    const nextTimeline = buildGanttTimeline(
      selectedEvent ? new Date(selectedEvent.eventDate) : new Date()
    );
    setTimeline(nextTimeline);
    const views = rawTasks.map((t, i) => mapApiTaskToGanttView(t, i, nextTimeline, new Map()));
    const titleByTaskId = new Map(views.map((t) => [t.id, t.title]));
    setTasks(applyGanttDependencyLabels(views, titleByTaskId));
  }, [rawTasks, selectedEventId, events]);

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

  const refreshTasks = useCallback(async () => {
    if (!selectedEventId) return;
    await invalidateEventTasks(selectedEventId);
  }, [invalidateEventTasks, selectedEventId]);

  const refreshEvents = useCallback(async () => {
    await invalidatePlannerEvents();
  }, [invalidatePlannerEvents]);

  const handleApplyCustomTemplate = async (replaceExisting = false) => {
    if (!user || !selectedEventId || !selectedCustomTemplateId) return;
    try {
      setApplyingCustomTemplate(true);
      setError(null);
      const token = await user.getIdToken();
      const result = await applyPlannerTaskTemplate(
        token,
        selectedCustomTemplateId,
        selectedEventId,
        replaceExisting
      );
      setChecklistMessage(result.message);
      patchPlannerEvent(selectedEventId, {
        taskPlanPhase: result.taskPlanPhase === "Full" ? "Full" : "Discovery",
        eventLifecycleStage:
          result.taskPlanPhase === "Full" ? "Planning" : undefined,
      });
      await refreshTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply your template.");
    } finally {
      setApplyingCustomTemplate(false);
    }
  };

  const tasksById = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);
  const taskIndexById = useMemo(() => {
    const map = new Map<string, number>();
    rawTasks.forEach((task, index) => map.set(task.id, index));
    return map;
  }, [rawTasks]);
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
    const sortedActive = sortGanttTasksForDisplay(partition.active);
    const groups = new Map<GanttTaskView["stage"], GanttTaskView[]>(
      order.map((stage) => [stage, [] as GanttTaskView[]])
    );
    for (const task of sortedActive) {
      groups.get(task.stage)!.push(task);
    }
    return order
      .map((stage) => ({ stage, items: groups.get(stage)! }))
      .filter((group) => group.items.length > 0);
  }, [partition.active]);

  useEffect(() => {
    const el = ganttHeaderRef.current;
    if (!el) return;
    const syncHeight = () => setGanttHeaderHeight(el.offsetHeight);
    syncHeight();
    const observer = new ResizeObserver(syncHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, [activeByStage.length, weekCount, tasks.length]);

  const selectedEvent = events.find((e) => e.eventId === selectedEventId);

  const needsFullChecklist =
    selectedEvent?.taskPlanPhase === "Discovery" ||
    (selectedEvent?.taskPlanPhase === "None" && tasks.length > 0 && tasks.length < 35);

  const isDiscoveryPhase = needsFullChecklist && selectedEvent?.taskPlanPhase !== "Full";

  useEffect(() => {
    if (!isDiscoveryPhase) return;
    setSetupStep(eventBrief?.isBriefComplete ? 3 : 1);
  }, [selectedEventId, eventBrief?.isBriefComplete, isDiscoveryPhase]);

  const handleRealign = async () => {
    if (!user || !selectedEventId) return;
    try {
      setRealigning(true);
      setError(null);
      setRealignMessage(null);
      const token = await user.getIdToken();
      const result = await realignEventTaskSchedule(token, selectedEventId);
      setRealignMessage(`${result.message} (${result.tasksUpdated} updated)`);
      await refreshTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to realign schedule.");
    } finally {
      setRealigning(false);
    }
  };

  const toIsoDate = (dateOnly: string): string | undefined => {
    if (!dateOnly) return undefined;
    return new Date(`${dateOnly}T12:00:00`).toISOString();
  };

  const openAddTask = () => {
    setTaskModalMode("add");
    setEditingTask(null);
    setTaskModalOpen(true);
  };

  const openEditTask = (taskId: string) => {
    const task = rawTasks.find((t) => t.id === taskId);
    if (!task) return;
    setTaskModalMode("edit");
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const handleTaskFormSave = async (values: TaskFormValues) => {
    if (!user || !selectedEventId) return;
    setTaskFormSaving(true);
    try {
      const token = await user.getIdToken();
      const payload = {
        title: values.title.trim(),
        description: editingTask?.description ?? null,
        status: values.status,
        startDate: toIsoDate(values.startDate) ?? null,
        dueDate: toIsoDate(values.dueDate) ?? null,
        dependsOnTaskId: values.dependsOnTaskId || null,
        updateDependency: true,
      };

      if (taskModalMode === "add") {
        await createTask(token, selectedEventId, {
          title: payload.title,
          startDate: payload.startDate ?? undefined,
          dueDate: payload.dueDate ?? undefined,
          dependsOnTaskId: payload.dependsOnTaskId ?? undefined,
        });
      } else if (editingTask) {
        await updateTask(token, selectedEventId, editingTask.id, payload);
      }

      setTaskModalOpen(false);
      setEditingTask(null);
      await refreshTasks();
    } finally {
      setTaskFormSaving(false);
    }
  };

  const handleTaskFormDelete = async () => {
    if (!user || !selectedEventId || !editingTask) return;
    const token = await user.getIdToken();
    await deleteTask(token, selectedEventId, editingTask.id);
    setTaskModalOpen(false);
    setEditingTask(null);
    await refreshTasks();
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
      void refreshTasks();
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
        t.id === state.taskId
          ? { ...t, startWeek: nextStart, stage: inferStage(nextStart, weekCount) }
          : t
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
      void refreshTasks();
      return;
    }

    void persistTaskWeeks(task.id, current.startWeek, current.duration);
  };

  const handleSeedDiscoveryTasks = async () => {
    if (!user || !selectedEventId) return;
    try {
      setSeedingDiscovery(true);
      setError(null);
      const token = await user.getIdToken();
      const result = await generateDiscoveryTasks(token, selectedEventId);
      setChecklistMessage(result.message);
      patchPlannerEvent(selectedEventId, {
        taskPlanPhase: "Discovery",
        eventLifecycleStage: "Onboarding",
      });
      await refreshTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate discovery tasks.");
    } finally {
      setSeedingDiscovery(false);
    }
  };

  const handleSeedMasterChecklist = async () => {
    if (!user || !selectedEventId) return;
    try {
      setSeedingMaster(true);
      setError(null);
      const token = await user.getIdToken();
      const result = await generateFullChecklist(token, selectedEventId);
      setChecklistMessage(result.message);
      patchPlannerEvent(selectedEventId, {
        taskPlanPhase: "Full",
        eventLifecycleStage: "Planning",
      });
      await refreshTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate master checklist.");
    } finally {
      setSeedingMaster(false);
    }
  };

  const handleChecklistApplied = useCallback(async () => {
    setChecklistMessage("Master checklist applied. Refreshing timeline…");
    patchPlannerEvent(selectedEventId, {
      taskPlanPhase: "Full",
      eventLifecycleStage: "Planning",
    });
    await refreshTasks();
    await refreshEvents();
    await invalidateEventBrief(selectedEventId);
  }, [
    selectedEventId,
    refreshTasks,
    refreshEvents,
    invalidateEventBrief,
    patchPlannerEvent,
  ]);

  return {
    brand,
    events,
    selectedEventId,
    selectedEvent,
    tasks,
    rawTasks,
    timeline,
    loading,
    error,
    setError,
    dependencyWarning,
    realignMessage,
    realigning,
    eventBrief,
    checklistMessage,
    setupStep,
    setSetupStep,
    showNewEventTip,
    setShowNewEventTip,
    seedingDiscovery,
    seedingMaster,
    showCompleted,
    setShowCompleted,
    draggingTaskId,
    savingTaskId,
    taskModalOpen,
    setTaskModalOpen,
    taskModalMode,
    editingTask,
    setEditingTask,
    taskFormSaving,
    saveTemplateOpen,
    setSaveTemplateOpen,
    customTemplates,
    selectedCustomTemplateId,
    setSelectedCustomTemplateId,
    applyingCustomTemplate,
    ganttHeaderRef,
    ganttHeaderHeight,
    weekCount,
    weekLabels,
    scheduleHealth,
    healthSummary,
    completedCount,
    partition,
    activeByStage,
    taskIndexById,
    isDiscoveryPhase,
    needsFullChecklist,
    handleSelectEvent,
    handleApplyCustomTemplate,
    handleRealign,
    openAddTask,
    openEditTask,
    handleTaskFormSave,
    handleTaskFormDelete,
    onBarPointerDown,
    onBarPointerMove,
    onBarPointerUp,
    handleSeedDiscoveryTasks,
    handleSeedMasterChecklist,
    handleChecklistApplied,
    refetchEvents,
    refetchTasks,
    setChecklistMessage,
    invalidateEventBrief,
  };
}
