"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bot, CalendarRange, ClipboardList, Sparkles, Store } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { getPlannerEvents, PlannerEventListItem } from "@/shared/lib/api/planner";
import { AiToolbar } from "@/modules/planner/ai/AiToolbar";
import { TaskSuggestionPanel } from "@/modules/planner/ai/TaskSuggestionPanel";
import { VendorSuggestionPanel } from "@/modules/planner/ai/VendorSuggestionPanel";
import {
  computeAiPortfolioStats,
  eventsForAiWorkflow,
  mapEventToAiContext,
  parseAiTool,
  type AiTool,
} from "@/modules/planner/ai/plannerAiHelpers";
import { usePlannerCreateEventModal } from "@/modules/planner/subscription/PlannerCreateEventProvider";
import { ErrorBanner } from "@/modules/planner/components/ui";
import { EmptyState, PageLoadingSkeleton } from "@/shared/components/ui";
import {
  GlassButton,
  GlassPageHeader,
  GlassSectionCard,
  GlassStatCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";

export default function PlannerAiPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventIdFromUrl = searchParams.get("eventId");
  const toolFromUrl = parseAiTool(searchParams.get("tool"));
  const { openCreateEventModal } = usePlannerCreateEventModal();

  const [events, setEvents] = useState<PlannerEventListItem[]>([]);
  const [tool, setTool] = useState<AiTool>(toolFromUrl);
  const [eventId, setEventId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const syncUrl = useCallback(
    (nextEventId: string, nextTool: AiTool) => {
      const params = new URLSearchParams();
      if (nextEventId) params.set("eventId", nextEventId);
      if (nextTool !== "tasks") params.set("tool", nextTool);
      const query = params.toString();
      router.replace(query ? `/planner/ai?${query}` : "/planner/ai", { scroll: false });
    },
    [router]
  );

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const data = await getPlannerEvents(token);
      setEvents(data);
      setEventId((prev) => {
        const workflowEvents = eventsForAiWorkflow(data);
        if (eventIdFromUrl && workflowEvents.some((event) => event.eventId === eventIdFromUrl)) {
          return eventIdFromUrl;
        }
        if (prev && workflowEvents.some((event) => event.eventId === prev)) {
          return prev;
        }
        return workflowEvents[0]?.eventId || "";
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events.");
    } finally {
      setLoading(false);
    }
  }, [user, eventIdFromUrl]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setTool(toolFromUrl);
  }, [toolFromUrl]);

  const workflowEvents = useMemo(() => eventsForAiWorkflow(events), [events]);
  const stats = useMemo(() => computeAiPortfolioStats(events), [events]);

  const eventContext = useMemo(() => {
    const event = workflowEvents.find((item) => item.eventId === eventId);
    return event ? mapEventToAiContext(event) : null;
  }, [workflowEvents, eventId]);

  const handleToolChange = (nextTool: AiTool) => {
    setTool(nextTool);
    syncUrl(eventId, nextTool);
  };

  const handleEventChange = (nextEventId: string) => {
    setEventId(nextEventId);
    syncUrl(nextEventId, tool);
  };

  if (loading && events.length === 0) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-6 pb-4 md:space-y-8">
      <GlassPageHeader
        title="AI assists"
        description="Suggest timeline tasks from notes and match verified vendors — you review before anything is added to the timeline or procurement shortlist."
        badge="Automation"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <GlassButton href="/planner/tasks" variant="ghost" className="gap-1.5">
              <CalendarRange size={16} aria-hidden />
              Timeline
            </GlassButton>
            <GlassButton href="/planner/procurement" variant="ghost" className="gap-1.5">
              <ClipboardList size={16} aria-hidden />
              Procurement
            </GlassButton>
          </div>
        }
      />

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <GlassStatCard
          label="Active weddings"
          value={stats.activeWeddings}
          sub={`${stats.portfolioTotal} in portfolio`}
          icon={Bot}
          iconTheme="primary"
        />
        <GlassStatCard
          label="Task assist"
          value={stats.readyForTasks}
          sub="From planner notes"
          icon={Sparkles}
          iconTheme="accent"
        />
        <GlassStatCard
          label="Vendor match"
          value={stats.readyForVendors}
          sub="Verified directory"
          icon={Store}
          iconTheme="success"
        />
      </div>

      <GlassSectionCard
        title={tool === "tasks" ? "Suggest tasks from notes" : "Suggest vendors for client"}
        subtitle={
          tool === "tasks"
            ? "AI proposes tasks — review, edit, then add only what you approve to the timeline."
            : "AI ranks verified vendors by budget, rating, and couple brief — you approve before shortlist."
        }
      >
        {workflowEvents.length === 0 && !loading ? (
          <EmptyState
            icon={Bot}
            title="No active weddings"
            description="Create a client event to use AI task and vendor suggestions."
            action={
              <GlassButton type="button" variant="primary" className="gap-1.5" onClick={openCreateEventModal}>
                <Sparkles size={16} aria-hidden />
                Create event
              </GlassButton>
            }
            className={cn(rf.panel, "border-0 shadow-none")}
          />
        ) : (
          <>
            <AiToolbar
              tool={tool}
              onToolChange={handleToolChange}
              events={workflowEvents}
              eventId={eventId}
              onEventIdChange={handleEventChange}
            />
            {tool === "tasks" ? (
              <TaskSuggestionPanel eventContext={eventContext} />
            ) : (
              <VendorSuggestionPanel eventContext={eventContext} />
            )}
          </>
        )}
      </GlassSectionCard>
    </div>
  );
}
