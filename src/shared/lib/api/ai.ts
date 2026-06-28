import { apiRequestJson } from "@/shared/lib/api/apiRequest";

export interface AiChatResponse {
  reply: string;
}

export interface AiVendorRecommendation {
  vendorId: string;
  businessName: string;
  score: number;
  reason: string;
}

export interface AiItineraryItem {
  id: string;
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
}

export interface AiItineraryResponse {
  itineraryId: string;
  items: AiItineraryItem[];
}

export async function sendAiChat(
  token: string,
  eventId: string,
  message: string
): Promise<AiChatResponse> {
  return apiRequestJson(
    token,
    "/api/ai/chat",
    {
      method: "POST",
      body: JSON.stringify({ eventId, message }),
    },
    { fallbackError: "Failed to get AI response." }
  );
}

export async function getAiVendorRecommendations(
  token: string,
  eventId: string,
  topN = 5
): Promise<AiVendorRecommendation[]> {
  return apiRequestJson(
    token,
    "/api/ai/recommend-vendors",
    {
      method: "POST",
      body: JSON.stringify({ eventId, topN }),
    },
    { fallbackError: "Failed to get recommendations." }
  );
}

export async function generateAiItinerary(
  token: string,
  eventId: string
): Promise<AiItineraryResponse> {
  return apiRequestJson(
    token,
    "/api/ai/itinerary/generate",
    {
      method: "POST",
      body: JSON.stringify({ eventId }),
    },
    { fallbackError: "Failed to generate itinerary." }
  );
}

export async function getAiItinerary(
  token: string,
  eventId: string
): Promise<AiItineraryResponse> {
  return apiRequestJson(
    token,
    `/api/ai/itinerary/${eventId}`,
    { method: "GET" },
    { fallbackError: "Failed to load itinerary." }
  );
}

export async function saveAiItinerary(
  token: string,
  itineraryId: string,
  items: Array<{ title: string; description?: string; startsAt: string; endsAt: string }>
): Promise<AiItineraryResponse> {
  return apiRequestJson(
    token,
    `/api/ai/itinerary/${itineraryId}`,
    {
      method: "PUT",
      body: JSON.stringify({ items }),
    },
    { fallbackError: "Failed to save itinerary." }
  );
}
