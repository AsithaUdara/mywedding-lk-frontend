"use client";


import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookmarkPlus,
  CalendarDays,
  CalendarRange,
  ChevronDown,
  ChevronRight,
  Clock3,
  ListTodo,
  Plus,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import { usePlannerCreateEventModal } from "@/modules/planner/subscription/PlannerCreateEventProvider";
import { TaskFormModal } from "@/modules/planner/tasks/TaskFormModal";
import { TaskIssueCard } from "@/modules/planner/tasks/TaskIssueCard";
import { TaskIssueCell } from "@/modules/planner/tasks/TaskIssueCell";
import { usePlannerTasksPage } from "@/modules/planner/tasks/usePlannerTasksPage";
import { SaveTaskTemplateModal } from "@/modules/planner/templates/SaveTaskTemplateModal";
import { EventBriefPanel } from "@/modules/planner/brief/EventBriefPanel";
import { ChecklistPlanWizard } from "@/modules/planner/checklist/ChecklistPlanWizard";
import { EventPickerSelect } from "@/modules/planner/planning/EventPlanningHeader";
import { PlannerSetupFlow } from "@/modules/planner/planning/PlannerSetupFlow";
import {
  GanttTaskView,
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
import { taskStatusShortLabel } from "@/modules/tasks/taskDisplay";

export default function PlannerTasksPage() {
  const { openCreateEventModal } = usePlannerCreateEventModal();
  const {
    brand,
    events,
    selectedEventId,
    selectedEvent,
    tasks,
    rawTasks,
    timeline,
    loading,
    error,
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
    healthSummary,
    completedCount,
    partition,
    activeByStage,
    taskIndexById,
    isDiscoveryPhase,
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
    scheduleHealth,
    setChecklistMessage,
    invalidateEventBrief,
  } = usePlannerTasksPage();

  const renderGanttRow = (task: GanttTaskView) => (
    <div
      key={task.id}
      className="group/row grid grid-cols-[minmax(240px,300px)_1fr] items-stretch border-b border-[#EBECF0] bg-white transition-colors last:border-b-0 hover:bg-[#FAFBFC]"
    >
      <div className="border-r border-[#EBECF0]">
        <TaskIssueCell
          task={task}
          taskIndex={taskIndexById.get(task.id) ?? 0}
          onOpen={openEditTask}
        />
      </div>

      <div
        className="relative mx-3 my-2 h-8 rounded bg-[#F4F5F7]"
        style={{
          backgroundImage: `repeating-linear-gradient(to right, #DFE1E6 0, #DFE1E6 1px, transparent 1px, transparent calc(100% / ${weekCount}))`,
        }}
        onPointerMove={(e) => {
          const width = (e.currentTarget as HTMLDivElement).offsetWidth;
          onBarPointerMove(e, width);
        }}
      >
        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-[#DE350B]/60"
          style={{ left: `${((weekCount - 0.5) / weekCount) * 100}%` }}
          aria-hidden
        />

        {task.isMilestone ? (
          <div
            className="absolute top-1/2 z-[1] h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-sm bg-[#DE350B] shadow-sm ring-2 ring-[#DE350B]/30"
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
              "absolute top-1/2 flex h-6 -translate-y-1/2 cursor-grab items-center justify-end overflow-hidden rounded px-2 text-[10px] font-semibold text-white shadow-sm active:cursor-grabbing",
              task.status === "InProgress" ? "bg-[#0052CC]" : "bg-[#42526E]",
              (draggingTaskId === task.id || savingTaskId === task.id) &&
                "opacity-80 ring-2 ring-[#0052CC]/40"
            )}
            style={{
              left: `calc(${(task.startWeek / weekCount) * 100}% + 2px)`,
              width: `calc(${(task.duration / weekCount) * 100}% - 4px)`,
              minWidth: "56px",
            }}
          >
            <span
              className="absolute inset-y-0 left-0 bg-[#36B37E]/50"
              style={{ width: `${task.completion}%` }}
              aria-hidden
            />
            <span className="relative z-[1] tabular-nums">{taskStatusShortLabel(task.status)}</span>
          </div>
        )}
      </div>
    </div>
  );

  const timelineWorkspace = (
    <>
      {partition.catchUp.length > 0 && (
        <GlassSectionCard
          title="Catch-up queue"
          subtitle={`${partition.catchUp.length} overdue issue${partition.catchUp.length === 1 ? "" : "s"} — click a card to edit or use Realign to reschedule`}
        >
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {partition.catchUp.map((task) => (
              <TaskIssueCard
                key={task.id}
                task={task}
                taskIndex={taskIndexById.get(task.id) ?? 0}
                onOpen={openEditTask}
                variant="overdue"
              />
            ))}
          </div>
        </GlassSectionCard>
      )}

      <GlassSectionCard
        title={isDiscoveryPhase ? "Starter tasks" : "Your timeline"}
        subtitle={
          isDiscoveryPhase
            ? "Click any issue to edit · drag schedule bars to change dates"
            : "Click any issue to edit · drag bars on the timeline to reschedule"
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            {selectedEventId && (
              <GlassButton type="button" variant="primary" className="gap-1.5" onClick={openAddTask}>
                <Plus size={14} aria-hidden />
                Add task
              </GlassButton>
            )}
            {savingTaskId ? (
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
            )}
          </div>
        }
      >
        {tasks.length === 0 && !loading ? (
          <EmptyState
            title="No tasks on this timeline yet"
            description="Add tasks one by one, or apply a standard wedding template to seed the Gantt."
            action={
              selectedEventId ? (
                <div className="flex flex-wrap justify-center gap-2">
                  <GlassButton type="button" variant="primary" className="gap-1.5" onClick={openAddTask}>
                    <Plus size={14} aria-hidden />
                    Add first task
                  </GlassButton>
                  <GlassButton
                    type="button"
                    variant="ghost"
                    disabled={seedingDiscovery}
                    onClick={() => void handleSeedDiscoveryTasks()}
                  >
                    {seedingDiscovery ? "Generating…" : "Starter template (8)"}
                  </GlassButton>
                  <GlassButton
                    type="button"
                    variant="ghost"
                    disabled={seedingMaster}
                    onClick={() => void handleSeedMasterChecklist()}
                  >
                    {seedingMaster ? "Generating…" : "Master template (50)"}
                  </GlassButton>
                  {customTemplates.length > 0 && (
                    <>
                      <select
                        value={selectedCustomTemplateId}
                        onChange={(e) => setSelectedCustomTemplateId(e.target.value)}
                        className={cn(inputClass, "rounded-full border-white/55 bg-white/40 px-3 py-1.5 text-xs")}
                      >
                        {customTemplates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.taskCount})
                          </option>
                        ))}
                      </select>
                      <GlassButton
                        type="button"
                        variant="ghost"
                        disabled={applyingCustomTemplate || !selectedCustomTemplateId}
                        onClick={() => void handleApplyCustomTemplate(false)}
                      >
                        {applyingCustomTemplate ? "Applying…" : "My template"}
                      </GlassButton>
                    </>
                  )}
                </div>
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
          <div className="rounded-lg border border-[#DFE1E6] bg-white shadow-sm">
            <div className="max-h-[min(60vh,640px)] overflow-auto">
              <div className="min-w-[800px]">
                <div
                  ref={ganttHeaderRef}
                  className="sticky top-0 z-30 grid grid-cols-[minmax(240px,300px)_1fr] border-b border-[#DFE1E6] bg-[#FAFBFC]"
                >
                  <div className="border-r border-[#DFE1E6] px-3 py-2.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#5E6C84]">
                      Issues
                    </span>
                    <span className="mt-0.5 block text-[11px] font-normal normal-case text-[#97A0AF]">
                      {partition.active.length} active
                    </span>
                  </div>
                  <div className="relative border-l border-[#EBECF0] px-3 py-2.5">
                    <div className="relative h-6 min-w-0">
                      {weekLabels.map((week) =>
                        week.label ? (
                          <span
                            key={week.index}
                            className={cn(
                              "absolute whitespace-nowrap text-[11px] tabular-nums",
                              week.isWedding
                                ? "right-0 translate-x-0 font-bold text-[#DE350B]"
                                : "-translate-x-1/2 font-semibold text-[#97A0AF]"
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
                      className="sticky z-20 grid grid-cols-[minmax(240px,300px)_1fr] border-b border-[#DFE1E6] bg-[#F4F5F7] shadow-[inset_0_-1px_0_#EBECF0]"
                      style={{ top: ganttHeaderHeight }}
                    >
                      <div className="flex items-center border-r border-[#EBECF0] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                        {group.stage}
                        <span className="ml-1.5 font-normal text-[#97A0AF]">
                          ({group.items.length})
                        </span>
                      </div>
                      <div className="min-h-[34px] bg-[#F4F5F7]" aria-hidden />
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
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {partition.completed.map((task) => (
                <TaskIssueCard
                  key={task.id}
                  task={task}
                  taskIndex={taskIndexById.get(task.id) ?? 0}
                  onOpen={openEditTask}
                />
              ))}
            </div>
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
              {selectedEventId && tasks.length > 0 && (
                <GlassButton
                  type="button"
                  variant="ghost"
                  className="gap-1.5 whitespace-nowrap"
                  onClick={() => setSaveTemplateOpen(true)}
                >
                  <BookmarkPlus size={16} aria-hidden />
                  Save template
                </GlassButton>
              )}
              {selectedEventId && (
                <GlassButton
                  href={`/events/${selectedEventId}/checklist`}
                  variant="ghost"
                  className="gap-1.5 whitespace-nowrap"
                >
                  <ListTodo size={16} aria-hidden />
                  My Tasks
                </GlassButton>
              )}
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

      {selectedEvent && tasks.length > 0 && !isDiscoveryPhase && scheduleHealth.overdue > 0 && (
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
            <GlassButton type="button" variant="primary" onClick={openCreateEventModal}>
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
                onBriefUpdated={() => void invalidateEventBrief(selectedEventId)}
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

      <TaskFormModal
        open={taskModalOpen}
        mode={taskModalMode}
        eventId={selectedEventId}
        tasks={rawTasks}
        saving={taskFormSaving}
        initial={
          editingTask
            ? {
                taskId: editingTask.id,
                title: editingTask.title,
                status: editingTask.status,
                startDate: editingTask.startDate ?? undefined,
                dueDate: editingTask.dueDate ?? undefined,
                dependsOnTaskId: editingTask.dependsOnTaskId ?? "",
              }
            : undefined
        }
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleTaskFormSave}
        onDelete={taskModalMode === "edit" ? handleTaskFormDelete : undefined}
      />

      <SaveTaskTemplateModal
        open={saveTemplateOpen}
        eventId={selectedEventId}
        eventName={selectedEvent?.eventName}
        taskCount={tasks.length}
        onClose={() => setSaveTemplateOpen(false)}
        onSaved={() => setChecklistMessage("Template saved. Find it under Settings or when creating events.")}
      />
    </div>
  );
}
