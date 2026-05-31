"use client";

import { useEffect, useState } from "react";
import { Sparkles, Bot } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { getEvents } from "@/shared/lib/api/events";
import {
  generateAiItinerary,
  getAiItinerary,
  getAiVendorRecommendations,
  saveAiItinerary,
} from "@/shared/lib/api/ai";
import AIChatWidget from "@/modules/ai/AIChatWidget";
import { ErrorBanner, inputClass } from "@/shared/components/ui";
import {
  GlassButton,
  GlassSectionCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { RegalFrostShell } from "@/modules/design-system/regal-frost/RegalFrostShell";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";

const glassInput = cn(inputClass, "border-white/55 bg-white/40 backdrop-blur-sm");
const glassInputSm = cn(glassInput, "px-2 py-1 text-xs");

const glassRow =
  "rounded-xl border border-white/55 bg-white/40 p-3 backdrop-blur-sm transition-all hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/55";

interface EventSummary {
  id: string;
  eventName: string;
}

export default function AiPlanningPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [eventId, setEventId] = useState("");
  const [recommendations, setRecommendations] = useState<
    Array<{ vendorId: string; businessName: string; score: number; reason: string }>
  >([]);
  const [itineraryId, setItineraryId] = useState("");
  const [itinerary, setItinerary] = useState<
    Array<{ id: string; title: string; description?: string; startsAt: string; endsAt: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const data = await getEvents(token);
        setEvents(data || []);
        if (data?.length) setEventId(data[0].id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load events.");
      }
    };
    void load();
  }, [user]);

  const runAi = async () => {
    if (!user || !eventId) return;
    try {
      setLoading(true);
      setError(null);
      const token = await user.getIdToken();
      const recs = await getAiVendorRecommendations(token, eventId, 5);
      setRecommendations(recs);

      await generateAiItinerary(token, eventId);
      const itineraryResponse = await getAiItinerary(token, eventId);
      setItineraryId(itineraryResponse.itineraryId);
      setItinerary(itineraryResponse.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI processing failed.");
    } finally {
      setLoading(false);
    }
  };

  const saveItinerary = async () => {
    if (!user || !itineraryId) return;
    try {
      const token = await user.getIdToken();
      await saveAiItinerary(
        token,
        itineraryId,
        itinerary.map((item) => ({
          title: item.title,
          description: item.description,
          startsAt: item.startsAt,
          endsAt: item.endsAt,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save itinerary.");
    }
  };

  return (
    <RegalFrostShell mesh className="min-h-screen px-4 py-10">
      <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
        <GlassSectionCard
          className="lg:col-span-2"
          title="AI Wedding Intelligence"
          subtitle="Smart vendor matchmaking and auto-generated wedding day timelines"
          action={
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                <Sparkles size={18} strokeWidth={2} aria-hidden />
              </div>
            </div>
          }
        >
          <div className="flex flex-col gap-3 md:flex-row">
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className={cn(glassInput, "md:min-w-[220px]")}
            >
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.eventName}
                </option>
              ))}
            </select>
            <GlassButton
              type="button"
              variant="primary"
              onClick={() => void runAi()}
              disabled={loading || !eventId}
              className="gap-1.5"
            >
              <Sparkles size={14} aria-hidden />
              {loading ? "Analyzing…" : "Run AI matchmaking"}
            </GlassButton>
          </div>

          {error && (
            <div className="mt-4">
              <ErrorBanner message={error} />
            </div>
          )}

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h2 className={rf.sectionTitle}>Recommended vendors</h2>
              <div className="mt-3 space-y-2">
                {recommendations.length === 0 ? (
                  <p className={cn("rounded-xl border border-dashed border-white/60 bg-white/25 py-6 text-center", rf.subtitle)}>
                    No recommendations yet. Run matchmaking to see vendor picks.
                  </p>
                ) : (
                  recommendations.map((item) => (
                    <div key={item.vendorId} className={glassRow}>
                      <p className="font-semibold text-foreground">{item.businessName}</p>
                      <p className={cn("mt-0.5", rf.caption)}>Score: {item.score.toFixed(2)}</p>
                      <p className={cn("mt-1 text-sm", rf.subtitle)}>{item.reason}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h2 className={rf.sectionTitle}>Generated itinerary</h2>
              <div className="mt-3 space-y-2">
                {itinerary.length === 0 ? (
                  <p className={cn("rounded-xl border border-dashed border-white/60 bg-white/25 py-6 text-center", rf.subtitle)}>
                    No itinerary generated yet.
                  </p>
                ) : (
                  <>
                    {itinerary.map((item, index) => (
                      <div key={item.id} className={cn(glassRow, "space-y-2")}>
                        <input
                          value={item.title}
                          onChange={(e) =>
                            setItinerary((prev) =>
                              prev.map((x, i) => (i === index ? { ...x, title: e.target.value } : x))
                            )
                          }
                          className={cn(
                            glassInput,
                            "border-0 border-b border-white/55 bg-transparent px-0 font-semibold text-foreground shadow-none focus:bg-white/30"
                          )}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="datetime-local"
                            value={new Date(item.startsAt).toISOString().slice(0, 16)}
                            onChange={(e) =>
                              setItinerary((prev) =>
                                prev.map((x, i) =>
                                  i === index
                                    ? { ...x, startsAt: new Date(e.target.value).toISOString() }
                                    : x
                                )
                              )
                            }
                            className={glassInputSm}
                          />
                          <input
                            type="datetime-local"
                            value={new Date(item.endsAt).toISOString().slice(0, 16)}
                            onChange={(e) =>
                              setItinerary((prev) =>
                                prev.map((x, i) =>
                                  i === index
                                    ? { ...x, endsAt: new Date(e.target.value).toISOString() }
                                    : x
                                )
                              )
                            }
                            className={glassInputSm}
                          />
                        </div>
                      </div>
                    ))}
                    <GlassButton type="button" variant="primary" onClick={() => void saveItinerary()}>
                      Save itinerary
                    </GlassButton>
                  </>
                )}
              </div>
            </div>
          </div>
        </GlassSectionCard>

        <GlassSectionCard
          title="AI Assistant"
          subtitle="Ask style, vendor, and budget questions in the chat"
        >
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <Bot size={28} strokeWidth={1.75} aria-hidden />
            </div>
            <p className={rf.subtitle}>
              Use the floating chat button in the bottom-right corner for quick planning help.
            </p>
          </div>
          <AIChatWidget />
        </GlassSectionCard>
      </section>
    </RegalFrostShell>
  );
}
