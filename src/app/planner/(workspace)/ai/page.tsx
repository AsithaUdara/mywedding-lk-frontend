"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  CalendarRange,
  MessageSquare,
  Sparkles,
  Store,
  Wand2,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { getPlannerEvents, PlannerEventListItem } from "@/shared/lib/api/planner";
import { ErrorBanner } from "@/modules/planner/components/ui";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  PageLoadingSkeleton,
  QuickActionLink,
  SectionCard,
  StatCard,
} from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";

const COPILOT_TOOLS = [
  {
    title: "AI planning workspace",
    description: "Chat, vendor recommendations, and day-of itinerary generation.",
    href: "/ai",
    icon: Bot,
  },
  {
    title: "Timeline auto-schedule",
    description: "Reschedule task bars on the 16-week master Gantt.",
    href: "/planner/tasks",
    icon: CalendarRange,
  },
  {
    title: "Vendor directory",
    description: "Browse Sri Lankan vendors to shortlist for clients.",
    href: "/vendors",
    icon: Store,
  },
];

export default function PlannerAiPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<PlannerEventListItem[]>([]);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const data = await getPlannerEvents(token, showAllEvents ? undefined : "Active");
      setEvents(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events.");
    } finally {
      setLoading(false);
    }
  }, [user, showAllEvents]);

  useEffect(() => {
    void load();
  }, [load]);

  const activeCount = useMemo(
    () => events.filter((e) => e.status === "Active").length,
    [events]
  );

  if (loading && events.length === 0) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-8 pb-4">
      <PageHeader
        title="AI Copilot"
        description="Plan faster with chat, vendor matchmaking, and itinerary tools — scoped to each wedding you manage."
        badge="Automation"
        action={
          <Button href="/ai" size="sm">
            <Sparkles size={16} aria-hidden />
            Launch workspace
          </Button>
        }
      />

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Events in view"
          value={events.length}
          sub={!showAllEvents ? "Active weddings" : "All statuses"}
          icon={MessageSquare}
          iconTheme="primary"
          index={0}
        />
        <StatCard
          label="Active weddings"
          value={activeCount}
          icon={Wand2}
          iconTheme="accent"
          index={1}
        />
        <StatCard
          label="Quick links"
          value={3}
          icon={Sparkles}
          iconTheme="success"
          index={2}
        />
      </div>

      <Card
        className={cn(
          "relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary via-primary/95 to-sidebar p-6 text-primary-foreground md:p-8",
          "shadow-lg shadow-primary/20"
        )}
        padding
      >
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-accent/20 blur-2xl"
          aria-hidden
        />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="font-playfair text-2xl font-bold md:text-3xl">
              Your planning copilot
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-primary-foreground/85">
              Open the full AI workspace for chat, vendor scoring, and itinerary drafts. Pick a
              wedding below to keep recommendations in context.
            </p>
          </div>
          <Button
            href="/ai"
            variant="accent"
            size="lg"
            className="shrink-0 shadow-md"
          >
            <Bot size={18} aria-hidden />
            Open AI workspace
            <ArrowRight size={16} aria-hidden />
          </Button>
        </div>
      </Card>

      <SectionCard title="Quick tools" subtitle="Jump into the workflows planners use most">
        <div className="grid gap-3 sm:grid-cols-3">
          {COPILOT_TOOLS.map((tool) => (
            <QuickActionLink
              key={tool.href}
              href={tool.href}
              label={tool.title}
              description={tool.description}
              icon={<tool.icon size={18} />}
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="By wedding"
        subtitle="Run AI in the context of a client celebration"
        action={
          <button
            type="button"
            onClick={() => setShowAllEvents((v) => !v)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              showAllEvents
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {showAllEvents ? "Showing all" : "Active only"}
          </button>
        }
      >
        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading weddings…</p>
        ) : events.length === 0 ? (
          <EmptyState
            title="No weddings to assist"
            description="AI tools work best when tied to an active client event."
            action={
              <Button href="/planner/events" size="sm">
                Create event
              </Button>
            }
            className="border-0 bg-transparent shadow-none"
          />
        ) : (
          <ul className="space-y-4" role="list">
            {events.map((event) => (
              <li
                key={event.eventId}
                className="rounded-2xl border border-border bg-background/80 p-5 transition-all duration-200 hover:border-primary/25 hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-4">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent"
                      aria-hidden
                    >
                      <Sparkles size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-foreground">
                        {event.eventName}
                      </h3>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {event.clientEmail || "No client email"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {event.status && (
                          <Badge variant="status" status={event.status}>
                            {event.status}
                          </Badge>
                        )}
                        <Badge variant="accent" className="normal-case tracking-normal">
                          Itinerary & vendors
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button href={`/ai?eventId=${event.eventId}`} size="sm">
                      Run AI
                      <ArrowRight size={14} aria-hidden />
                    </Button>
                    <Button
                      href={`/events/${event.eventId}`}
                      variant="secondary"
                      size="sm"
                    >
                      Event hub
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
