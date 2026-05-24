"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Bot, Sparkles, Wand2 } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { getPlannerEvents, PlannerEventListItem } from "@/shared/lib/api/planner";
import {
  EmptyState,
  EventHubCard,
  LoadingState,
  PageHeader,
  SectionCard,
} from "@/modules/planner/components/ui";

export default function PlannerAiPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<PlannerEventListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const data = await getPlannerEvents(token, "Active");
      setEvents(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="space-y-8">
      <PageHeader
        title="AI Assistant"
        description="Smart vendor matchmaking and itinerary generation for your active weddings."
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-charcoal via-slate-800 to-primary p-8 text-white shadow-xl"
      >
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-lg">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} />
              Powered by AI
            </div>
            <h2 className="font-playfair text-2xl font-bold">Open full AI workspace</h2>
            <p className="mt-2 text-sm text-white/80">
              Chat with your planning copilot, get vendor recommendations, and generate day-of itineraries.
            </p>
          </div>
          <Link
            href="/ai"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-charcoal shadow-lg transition hover:bg-white/95"
          >
            <Bot size={18} />
            Launch AI
            <ArrowRight size={16} />
          </Link>
        </div>
        <Wand2 className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 text-white/5" />
      </motion.div>

      <SectionCard title="Per-event AI" subtitle="Select a wedding to apply recommendations in context">
        {loading ? (
          <LoadingState label="Loading events…" />
        ) : events.length === 0 ? (
          <EmptyState
            title="No active events"
            description="AI tools work best when tied to a specific client wedding."
          />
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <EventHubCard
                key={event.eventId}
                eventName={event.eventName}
                clientEmail={event.clientEmail}
                href={`/events/${event.eventId}`}
                actionLabel="Open event"
                badges={
                  <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    Itinerary & vendors
                  </span>
                }
              />
            ))}
          </div>
        )}
      </SectionCard>
    </section>
  );
}
