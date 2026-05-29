"use client";

import Link from "next/link";
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
import { ErrorBanner } from "@/modules/planner/components/ui";
import {
  Badge,
  Button,
  EmptyState,
  PageHeader,
  PageLoadingSkeleton,
  StatCard,
  formatLKR,
} from "@/shared/components/ui";
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
  Lead: "border-t-muted-foreground/40",
  Onboarding: "border-t-warning",
  Planning: "border-t-accent",
  Execution: "border-t-primary",
  Archived: "border-t-border",
};

const priorityVariant: Record<ClientCard["priority"], "default" | "accent" | "muted"> = {
  High: "default",
  Medium: "accent",
  Low: "muted",
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
    load();
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
    <div className="space-y-8 pb-4">
      {error && <ErrorBanner message={error} />}

      <PageHeader
        title="Clients pipeline"
        description="Drag and drop each client event through lifecycle stages — from lead to archived."
        badge="CRM"
        action={
          <Button href="/planner/events" size="sm">
            <UserRoundPlus size={16} aria-hidden />
            Add new lead
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Managed clients"
          value={clients.length}
          icon={Users}
          iconTheme="primary"
          index={0}
        />
        <StatCard
          label="Pipeline value"
          value={formatLKR(totalValue)}
          icon={CircleDollarSign}
          iconTheme="accent"
          index={1}
        />
        <StatCard
          label="Active / progress"
          value={`${activeCount} · ${weightedProgress}%`}
          icon={CalendarClock}
          iconTheme="success"
          index={2}
        />
      </div>

      {clients.length === 0 ? (
        <EmptyState
          title="No clients in your pipeline"
          description="Create a client event to start tracking lifecycle stages."
          action={
            <Button href="/planner/events" size="sm">
              Create first event
            </Button>
          }
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
                  "rounded-3xl border border-border bg-card p-4 shadow-sm",
                  "border-t-4",
                  STAGE_ACCENT[stage]
                )}
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {stage}
                  </p>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold tabular-nums text-primary">
                    {stageItems.length}
                  </span>
                </div>

                <div className="space-y-3 min-h-[120px]">
                  {stageItems.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-border bg-muted/40 px-3 py-8 text-center text-xs text-muted-foreground">
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
                        "cursor-grab rounded-2xl border border-border bg-background p-4 shadow-sm transition-all duration-200",
                        "active:cursor-grabbing hover:border-primary/25 hover:shadow-md",
                        (draggingId === client.id || savingId === client.id) && "opacity-60"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{client.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{client.couple}</p>
                        </div>
                        <GripVertical
                          size={14}
                          className="mt-0.5 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                      </div>
                      <p className="mt-2 truncate text-[11px] text-muted-foreground">{client.email}</p>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
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
                        <Badge variant={priorityVariant[client.priority]}>{client.priority}</Badge>
                        <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
                          {client.completion}%
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>
                          {new Date(client.weddingDate).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <Link
                          href={`/events/${client.id}`}
                          className="inline-flex items-center gap-0.5 font-semibold text-primary hover:underline"
                        >
                          Open
                          <ArrowRight size={12} aria-hidden />
                        </Link>
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
