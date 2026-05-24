"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { getEvents } from "@/shared/lib/api/events";
import { generateAiItinerary, getAiItinerary, getAiVendorRecommendations, saveAiItinerary } from "@/shared/lib/api/ai";
import AIChatWidget from "@/modules/ai/AIChatWidget";

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
    <main className="min-h-screen bg-cream px-4 py-10">
      <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow lg:col-span-2">
          <h1 className="text-2xl font-bold text-charcoal">AI Wedding Intelligence</h1>
          <p className="mt-2 text-sm text-slate-600">Get smart vendor matchmaking and auto-generated wedding day timelines.</p>

          <div className="mt-5 flex flex-col gap-3 md:flex-row">
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary"
            >
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.eventName}
                </option>
              ))}
            </select>
            <button onClick={runAi} disabled={loading || !eventId} className="rounded-xl bg-primary px-4 py-3 font-semibold text-white disabled:opacity-60">
              {loading ? "Analyzing..." : "Run AI Matchmaking"}
            </button>
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="text-lg font-bold text-charcoal">Recommended Vendors</h2>
              <div className="mt-3 space-y-2">
                {recommendations.length === 0 ? (
                  <p className="text-sm text-slate-500">No recommendations yet.</p>
                ) : (
                  recommendations.map((item) => (
                    <div key={item.vendorId} className="rounded-xl border border-slate-200 p-3">
                      <p className="font-semibold text-charcoal">{item.businessName}</p>
                      <p className="text-xs text-slate-500">Score: {item.score.toFixed(2)}</p>
                      <p className="text-sm text-slate-600">{item.reason}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-charcoal">Generated Itinerary</h2>
              <div className="mt-3 space-y-2">
                {itinerary.length === 0 ? (
                  <p className="text-sm text-slate-500">No itinerary generated yet.</p>
                ) : (
                  <>
                    {itinerary.map((item, index) => (
                      <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                        <input
                          value={item.title}
                          onChange={(e) =>
                            setItinerary((prev) =>
                              prev.map((x, i) => (i === index ? { ...x, title: e.target.value } : x))
                            )
                          }
                          className="w-full border-b border-slate-200 pb-1 font-semibold text-charcoal outline-none"
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
                            className="rounded border border-slate-200 px-2 py-1 text-xs"
                          />
                          <input
                            type="datetime-local"
                            value={new Date(item.endsAt).toISOString().slice(0, 16)}
                            onChange={(e) =>
                              setItinerary((prev) =>
                                prev.map((x, i) => (i === index ? { ...x, endsAt: new Date(e.target.value).toISOString() } : x))
                              )
                            }
                            className="rounded border border-slate-200 px-2 py-1 text-xs"
                          />
                        </div>
                      </div>
                    ))}
                    <button onClick={saveItinerary} className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white">
                      Save Itinerary
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow">
          <h2 className="mb-3 text-lg font-bold text-charcoal">AI Assistant</h2>
          <p className="mb-2 text-xs text-slate-500">Use the floating chat to ask style, vendor, and budget questions.</p>
          <AIChatWidget />
        </div>
      </section>
    </main>
  );
}
