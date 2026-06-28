"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarClock, Plus, Users } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { EventLifecycleStage, updatePlannerEventStage } from "@/shared/lib/api/planner";
import { usePlannerClientsPipelineQuery } from "@/shared/hooks/query/usePlannerClientsPipelineQuery";
import { usePlannerQueryInvalidation } from "@/shared/hooks/query/useQueryInvalidation";
import { ClientKanbanCard } from "@/modules/planner/clients/ClientKanbanCard";
import {
  PIPELINE_STAGES,
  STAGE_HINTS,
  type ClientPipelineCard,
} from "@/modules/planner/clients/plannerClientHelpers";
import { formatWeddingDate } from "@/modules/planner/dashboard/plannerDashboardHelpers";
import { ErrorBanner } from "@/modules/planner/components/ui";
import { usePlannerCreateEventModal } from "@/modules/planner/subscription/PlannerCreateEventProvider";
import { EmptyState, PageLoadingSkeleton } from "@/shared/components/ui";
import {
  GlassButton,
  GlassPageHeader,
  GlassStatCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";

export default function PlannerClientsPage() {
  const { user } = useAuth();
  const { openCreateEventModal } = usePlannerCreateEventModal();
  const { invalidatePlannerEvents } = usePlannerQueryInvalidation();
  const {
    clients: serverClients,
    isLoading,
    error: queryError,
  } = usePlannerClientsPipelineQuery();
  const [clients, setClients] = useState<ClientPipelineCard[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    setClients(serverClients);
  }, [serverClients]);

  useEffect(() => {
    if (queryError) {
      setError(queryError.message);
    }
  }, [queryError]);

  const setupCount = useMemo(() => clients.filter((c) => c.needsSetup).length, [clients]);
  const nextWedding = useMemo(() => {
    const now = Date.now() - 24 * 60 * 60 * 1000;
    return (
      [...clients]
        .filter((c) => new Date(c.weddingDate).getTime() >= now)
        .sort((a, b) => new Date(a.weddingDate).getTime() - new Date(b.weddingDate).getTime())[0] ??
      null
    );
  }, [clients]);

  const moveCard = async (cardId: string, targetStage: EventLifecycleStage) => {
    const previous = clients;
    setClients((prev) =>
      prev.map((client) =>
        client.id === cardId ? { ...client, stage: targetStage } : client
      )
    );

    if (!user) return;
    try {
      setSavingId(cardId);
      const token = await user.getIdToken();
      await updatePlannerEventStage(token, cardId, targetStage);
      setError(null);
      void invalidatePlannerEvents();
    } catch (err) {
      setClients(previous);
      setError(err instanceof Error ? err.message : "Failed to update stage.");
    } finally {
      setSavingId(null);
    }
  };

  if (isLoading) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-6 pb-4 md:space-y-8">
      {error && <ErrorBanner message={error} />}

      <GlassPageHeader
        title="Clients"
        description="Kanban pipeline — drag cards between columns to update lifecycle stage."
        badge="Board"
        action={
          <GlassButton
            type="button"
            variant="primary"
            className="gap-1.5"
            onClick={openCreateEventModal}
          >
            <Plus size={16} aria-hidden />
            New client event
          </GlassButton>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <GlassStatCard
          label="In pipeline"
          value={clients.length}
          sub="Active client weddings"
          icon={Users}
          iconTheme="primary"
        />
        <GlassStatCard
          label="Setup needed"
          value={setupCount}
          sub={setupCount > 0 ? "Brief or checklist incomplete" : "All weddings on track"}
          icon={AlertTriangle}
          iconTheme={setupCount > 0 ? "warning" : "success"}
        />
        <GlassStatCard
          label="Next wedding"
          value={nextWedding ? nextWedding.daysUntil : "—"}
          sub={
            nextWedding
              ? `${nextWedding.title} · ${formatWeddingDate(nextWedding.weddingDate)}`
              : "No upcoming dates"
          }
          icon={CalendarClock}
          iconTheme="accent"
        />
      </div>

      {clients.length === 0 ? (
        <EmptyState
          title="No clients yet"
          description="Create a wedding event to start tracking lifecycle and planning progress."
          action={
            <GlassButton type="button" variant="primary" onClick={openCreateEventModal}>
              Create first event
            </GlassButton>
          }
          className={cn(rf.panel, "border-0 shadow-none")}
        />
      ) : (
        <div className="-mx-1 overflow-x-auto pb-2">
          <div className="flex min-w-min gap-3 px-1">
            {PIPELINE_STAGES.map((stage) => {
              const stageItems = clients.filter((client) => client.stage === stage);
              return (
                <section
                  key={stage}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const cardId = e.dataTransfer.getData("text/plain");
                    if (cardId) void moveCard(cardId, stage);
                    setDraggingId(null);
                  }}
                  className="flex w-[272px] shrink-0 flex-col rounded-lg bg-[#F4F5F7] p-2"
                >
                  <header className="flex items-start justify-between gap-2 px-1.5 py-2">
                    <div className="min-w-0">
                      <h2 className="text-xs font-semibold uppercase tracking-wide text-[#5E6C84]">
                        {stage}
                        <span className="ml-1 font-normal text-[#97A0AF]">({stageItems.length})</span>
                      </h2>
                      <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-[#97A0AF]">
                        {STAGE_HINTS[stage]}
                      </p>
                    </div>
                  </header>

                  <div className="flex min-h-[80px] flex-1 flex-col gap-2 rounded-md p-0.5">
                    {stageItems.length === 0 && (
                      <div className="rounded border border-dashed border-[#C1C7D0] bg-[#FAFBFC]/60 px-3 py-8 text-center text-[11px] text-[#97A0AF]">
                        Drop issues here
                      </div>
                    )}
                    {stageItems.map((client) => (
                      <ClientKanbanCard
                        key={client.id}
                        client={client}
                        dragging={draggingId === client.id}
                        saving={savingId === client.id}
                        onDragStart={(id) => setDraggingId(id)}
                        onDragEnd={() => setDraggingId(null)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
