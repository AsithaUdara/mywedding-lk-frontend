const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function sendAiChat(token: string, eventId: string, message: string) {
  const res = await fetch(`${BASE}/api/ai/chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ eventId, message }),
  });
  if (!res.ok) throw new Error("Failed to get AI response.");
  return res.json();
}

export async function getAiVendorRecommendations(token: string, eventId: string, topN = 5) {
  const res = await fetch(`${BASE}/api/ai/recommend-vendors`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ eventId, topN }),
  });
  if (!res.ok) throw new Error("Failed to get recommendations.");
  return res.json();
}

export async function generateAiItinerary(token: string, eventId: string) {
  const res = await fetch(`${BASE}/api/ai/itinerary/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ eventId }),
  });
  if (!res.ok) throw new Error("Failed to generate itinerary.");
  return res.json();
}

export async function getAiItinerary(token: string, eventId: string) {
  const res = await fetch(`${BASE}/api/ai/itinerary/${eventId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to load itinerary.");
  return res.json();
}

export async function saveAiItinerary(
  token: string,
  itineraryId: string,
  items: Array<{ title: string; description?: string; startsAt: string; endsAt: string }>
) {
  const res = await fetch(`${BASE}/api/ai/itinerary/${itineraryId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error("Failed to save itinerary.");
  return res.json();
}
