"use client";

import { useCallback, useEffect, useState } from "react";
import { Bot, CalendarRange, Sparkles, Wand2 } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { getPlannerEvents, PlannerEventListItem } from "@/shared/lib/api/planner";
import { DraftInquiryForm } from "@/modules/planner/ai/DraftInquiryForm";
import { MeetingSummarizer } from "@/modules/planner/ai/MeetingSummarizer";
import { ErrorBanner } from "@/modules/planner/components/ui";
import { EmptyState, PageLoadingSkeleton } from "@/shared/components/ui";
import {
  GlassButton,
  GlassPageHeader,
  GlassStatCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";

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
    <div className="space-y-6 pb-4 md:space-y-8">
      <GlassPageHeader
        title="AI Copilot"
        description="Draft vendor outreach and turn meeting notes into Gantt tasks — powered by your live planner AI endpoints."
        badge="Automation"
        action={
          <GlassButton href="/planner/tasks" variant="ghost" className="gap-1.5">
            <CalendarRange size={16} aria-hidden />
            Open timeline
          </GlassButton>
        }
      />

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <GlassStatCard
          label="Active weddings"
          value={events.length}
          sub="Ready for AI workflows"
          icon={Bot}
          iconTheme="primary"
        />
        <GlassStatCard
          label="Copilot tools"
          value={2}
          sub="Inquiry drafts · meeting tasks"
          icon={Wand2}
          iconTheme="accent"
        />
      </div>

      {events.length === 0 && !loading ? (
        <EmptyState
          icon={Bot}
          title="No active weddings"
          description="Create a client event to use the AI copilot tools."
          action={
            <GlassButton href="/planner/dashboard#create-event-dashboard" variant="primary" className="gap-1.5">
              <Sparkles size={16} aria-hidden />
              Create event
            </GlassButton>
          }
          className={cn(rf.panel, "border-0 shadow-none")}
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-1">
          <DraftInquiryForm events={events} />
          <MeetingSummarizer events={events} />
        </div>
      )}
    </div>
  );
}
