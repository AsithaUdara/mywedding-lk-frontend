"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { getEvents } from "@/shared/lib/api/events";
import { generateAiItinerary, getAiItinerary, getAiVendorRecommendations, saveAiItinerary } from "@/shared/lib/api/ai";
import AIChatWidget from "@/modules/ai/AIChatWidget";
import { Button, Card, ErrorBanner, inputClass } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";

interface EventSummary {
  id: string;
  eventName: string;
}

export default function AiPlanningPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [eventId, setEventId] = useState("");
  const [recommendations, setRecommendations] = useState<Array<{ vendorId: string; businessName: string; score: number; reason: string }>>([]);
  const [itineraryId, setItineraryId] = useState("");
  const [itinerary, setItinerary] = useState<Array<{ id: string; title: string; description?: string; startsAt: string; endsAt: string }>>([]);
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
    load();
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
    <main className="min-h-screen bg-background px-4 py-10 font-roboto">
      <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 sm:p-8">
          <h1 className="font-playfair text-2xl font-bold text-foreground">AI Wedding Intelligence</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Get smart vendor matchmaking and auto-generated wedding day timelines.
          </p>

          <div className="mt-5 flex flex-col gap-3 md:flex-row">
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className={cn(inputClass, "md:min-w-[220px]")}
            >
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.eventName}
                </option>
              ))}
            </select>
            <Button onClick={() => void runAi()} disabled={loading || !eventId} variant="primary">
              {loading ? "Analyzing…" : "Run AI matchmaking"}
            </Button>
          </div>

          {error && (
            <div className="mt-4">
              <ErrorBanner message={error} />
            </div>
          )}

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="text-lg font-bold text-foreground">Recommended Vendors</h2>
              <div className="mt-3 space-y-2">
                {recommendations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recommendations yet.</p>
                ) : (
                  recommendations.map((item) => (
                    <div key={item.vendorId} className="rounded-xl border border-border p-3">
                      <p className="font-semibold text-foreground">{item.businessName}</p>
                      <p className="text-xs text-muted-foreground">Score: {item.score.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{item.reason}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-foreground">Generated Itinerary</h2>
              <div className="mt-3 space-y-2">
                {itinerary.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No itinerary generated yet.</p>
                ) : (
                  <>
                    {itinerary.map((item, index) => (
                      <div key={item.id} className="rounded-xl border border-border p-3">
                        <input
                          value={item.title}
                          onChange={(e) =>
                            setItinerary((prev) =>
                              prev.map((x, i) => (i === index ? { ...x, title: e.target.value } : x))
                            )
                          }
                          className="w-full border-b border-border pb-1 font-semibold text-foreground outline-none"
                        />
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <input
                            type="datetime-local"
                            value={new Date(item.startsAt).toISOString().slice(0, 16)}
                            onChange={(e) =>
                              setItinerary((prev) =>
                                prev.map((x, i) => (i === index ? { ...x, startsAt: new Date(e.target.value).toISOString() } : x))
                              )
                            }
                            className="rounded border border-border px-2 py-1 text-xs"
                          />
                          <input
                            type="datetime-local"
                            value={new Date(item.endsAt).toISOString().slice(0, 16)}
                            onChange={(e) =>
                              setItinerary((prev) =>
                                prev.map((x, i) => (i === index ? { ...x, endsAt: new Date(e.target.value).toISOString() } : x))
                              )
                            }
                            className="rounded border border-border px-2 py-1 text-xs"
                          />
                        </div>
                      </div>
                    ))}
                    <Button onClick={() => void saveItinerary()} variant="primary" className="text-sm">
                      Save itinerary
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="relative min-h-[200px] sm:p-8">
          <h2 className="mb-3 text-lg font-bold text-foreground">AI Assistant</h2>
          <p className="mb-2 text-xs text-muted-foreground">
            Use the floating chat to ask style, vendor, and budget questions.
          </p>
          <AIChatWidget />
        </Card>
      </section>
    </main>
  );
}
