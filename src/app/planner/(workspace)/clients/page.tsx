"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  CircleDollarSign,
  GripVertical,
  UserRoundPlus,
  Users,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  EventLifecycleStage,
  getPlannerEvents,
  PlannerEventListItem,
  updatePlannerEventStage,
} from "@/shared/lib/api/planner";
import { ErrorBanner, formatLKR } from "@/modules/planner/components/ui";
import { EmptyState, PageLoadingSkeleton } from "@/shared/components/ui";
import {
  GlassButton,
  GlassPageHeader,
  GlassStatCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

type ClientCard = {
  id: string;
  title: string;
  couple: string;
  email: string;
  weddingDate: string;
  budget: number;
  completion: number;
  stage: EventLifecycleStage;
  priority: "High" | "Medium" | "Low";
};

const STAGES: EventLifecycleStage[] = ["Lead", "Onboarding", "Planning", "Execution", "Archived"];

const STAGE_ACCENT: Record<EventLifecycleStage, string> = {
  Lead: "border-t-muted-foreground/50",
  Onboarding: "border-t-warning",
  Planning: "border-t-accent",
  Execution: "border-t-primary",
  Archived: "border-t-border",
};

const PRIORITY_PILL: Record<ClientCard["priority"], string> = {
  High: "bg-primary/10 text-primary ring-1 ring-primary/15",
  Medium: "bg-warning/10 text-warning ring-1 ring-warning/15",
  Low: "bg-white/50 text-muted-foreground ring-1 ring-white/60",
};

function completionForStage(stage: EventLifecycleStage): number {
  switch (stage) {
    case "Lead":
      return 12;
    case "Onboarding":
      return 25;
    case "Planning":
      return 45;
    case "Execution":
      return 70;
    case "Archived":
      return 100;
    default:
      return 0;
  }
}

function priorityForEvent(event: PlannerEventListItem): ClientCard["priority"] {
  const daysUntil = (new Date(event.eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (daysUntil <= 90) return "High";
  if (daysUntil <= 180) return "Medium";
  return "Low";
}

function mapEventToCard(event: PlannerEventListItem): ClientCard {
  const stage = (event.eventLifecycleStage ?? "Lead") as EventLifecycleStage;
  return {
    id: event.eventId,
    title: event.eventName,
    couple: event.clientEmail.split("@")[0] || "Client",
    email: event.clientEmail,
    weddingDate: event.eventDate,
    budget: event.totalBudget,
    completion: completionForStage(stage),
    stage,
    priority: priorityForEvent(event),
  };
}

export default function PlannerClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<ClientCard[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const events = await getPlannerEvents(token);
      setClients(events.map(mapEventToCard));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load clients.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalValue = useMemo(() => clients.reduce((sum, c) => sum + c.budget, 0), [clients]);
  const activeCount = useMemo(
    () => clients.filter((c) => c.stage !== "Lead" && c.stage !== "Archived").length,
    [clients]
  );
  const weightedProgress = useMemo(() => {
    if (clients.length === 0) return 0;
    return Math.round(clients.reduce((sum, c) => sum + c.completion, 0) / clients.length);
  }, [clients]);

  const moveCard = async (cardId: string, targetStage: EventLifecycleStage) => {
    const previous = clients;
    setClients((prev) =>
      prev.map((client) =>
        client.id === cardId
          ? {
              ...client,
              stage: targetStage,
              completion: completionForStage(targetStage),
            }
          : client
      )
    );

    if (!user) return;
    try {
      setSavingId(cardId);
      const token = await user.getIdToken();
      await updatePlannerEventStage(token, cardId, targetStage);
      setError(null);
    } catch (err) {
      setClients(previous);
      setError(err instanceof Error ? err.message : "Failed to update stage.");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-6 pb-4 md:space-y-8">
      {error && <ErrorBanner message={error} />}

      <GlassPageHeader
        title="Clients pipeline"
        description="Drag each client event through lifecycle stages — from lead to archived."
        badge="CRM"
        action={
          <GlassButton href="/planner/dashboard#create-event-dashboard" variant="primary" className="gap-1.5">
            <UserRoundPlus size={16} aria-hidden />
            Add new lead
          </GlassButton>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <GlassStatCard
          label="Managed clients"
          value={clients.length}
          sub="Events in your portfolio"
          icon={Users}
          iconTheme="primary"
        />
        <GlassStatCard
          label="Pipeline value"
          value={totalValue > 0 ? formatLKR(totalValue) : "—"}
          sub="Total wedding budgets"
          icon={CircleDollarSign}
          iconTheme="accent"
        />
        <GlassStatCard
          label="Active / progress"
          value={`${activeCount} · ${weightedProgress}%`}
          sub="In onboarding through execution"
          icon={CalendarClock}
          iconTheme="success"
        />
      </div>

      {clients.length === 0 ? (
        <EmptyState
          title="No clients in your pipeline"
          description="Create a client event to start tracking lifecycle stages."
          action={
            <GlassButton href="/planner/events" variant="primary">
              Create first event
            </GlassButton>
          }
          className={cn(rf.panel, "border-0 shadow-none")}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
          {STAGES.map((stage) => {
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
                className={cn(
                  rf.panel,
                  "border-t-4 p-4 sm:p-5",
                  STAGE_ACCENT[stage]
                )}
              >
                <div className="mb-4 flex items-center justify-between gap-2">
                  <p className={vg.label}>{stage}</p>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold tabular-nums text-primary">
                    {stageItems.length}
                  </span>
                </div>

                <div className="min-h-[120px] space-y-3">
                  {stageItems.length === 0 && (
                    <div
                      className={cn(
                        "rounded-xl border border-dashed border-white/60 bg-white/25 px-3 py-8 text-center",
                        vg.caption
                      )}
                    >
                      Drop client here
                    </div>
                  )}
                  {stageItems.map((client) => (
                    <article
                      key={client.id}
                      draggable={savingId !== client.id}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", client.id);
                        setDraggingId(client.id);
                      }}
                      onDragEnd={() => setDraggingId(null)}
                      className={cn(
                        "cursor-grab rounded-xl border border-white/55 bg-white/40 p-4 backdrop-blur-sm",
                        "transition-all duration-200 active:cursor-grabbing",
                        "hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/55 hover:shadow-[0_4px_20px_hsl(345_100%_25%/0.08)]",
                        (draggingId === client.id || savingId === client.id) && "opacity-60"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className={cn("truncate font-medium", vg.body)}>{client.title}</p>
                          <p className={cn("truncate", vg.caption)}>{client.couple}</p>
                        </div>
                        <GripVertical
                          size={14}
                          className="mt-0.5 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                      </div>
                      <p className={cn("mt-2 truncate", vg.caption)}>{client.email}</p>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/50 ring-1 ring-white/60">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-300"
                          style={{ width: `${Math.max(client.completion, 8)}%` }}
                          role="progressbar"
                          aria-valuenow={client.completion}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                            PRIORITY_PILL[client.priority]
                          )}
                        >
                          {client.priority}
                        </span>
                        <span className={cn("font-medium tabular-nums", vg.caption)}>
                          {client.completion}%
                        </span>
                      </div>
                      <div className={cn("mt-3 flex items-center justify-between", vg.caption)}>
                        <span>
                          {new Date(client.weddingDate).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <GlassButton href={`/events/${client.id}`} variant="ghost" className="gap-0.5 px-2 py-1">
                          Open
                          <ArrowRight size={12} aria-hidden />
                        </GlassButton>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
