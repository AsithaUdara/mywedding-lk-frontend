"use client";

import { useCallback, useEffect, useState } from "react";
import { Bot, Sparkles } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { getPlannerEvents, PlannerEventListItem } from "@/shared/lib/api/planner";
import { DraftInquiryForm } from "@/modules/planner/ai/DraftInquiryForm";
import { MeetingSummarizer } from "@/modules/planner/ai/MeetingSummarizer";
import { ErrorBanner } from "@/modules/planner/components/ui";
import { Button, EmptyState, PageHeader, PageLoadingSkeleton } from "@/shared/components/ui";

export default function PlannerAiPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<PlannerEventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const data = await getPlannerEvents(token, "Active");
      setEvents(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && events.length === 0) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-8 bg-background pb-4">
      <PageHeader
        title="AI Copilot"
        description="Draft vendor outreach and turn meeting notes into Gantt tasks — powered by your live planner AI endpoints."
        badge="Automation"
        action={
          <Button href="/planner/tasks" variant="secondary" size="sm">
            Open timeline
          </Button>
        }
      />

      {error && <ErrorBanner message={error} />}

      {events.length === 0 && !loading ? (
        <EmptyState
          icon={Bot}
          title="No active weddings"
          description="Create a client event to use the AI copilot tools."
          action={
            <Button href="/planner/events" size="sm">
              <Sparkles size={16} aria-hidden />
              Create event
            </Button>
          }
        />
      ) : (
        <div className="grid gap-8 xl:grid-cols-1">
          <DraftInquiryForm events={events} />
          <MeetingSummarizer events={events} />
        </div>
      )}
    </div>
  );
}
