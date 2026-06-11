import { parseApiError } from "@/shared/lib/api/parseApiError";
import type { TaskPlanPhase } from "@/shared/lib/api/planner";

export interface EventBrief {
  eventId: string;
  eventName: string;
  eventDate: string;
  totalBudget: number;
  taskPlanPhase: TaskPlanPhase;
  eventLifecycleStage: string;
  estimatedGuestCount: number | null;
  guestCountMax: number | null;
  weddingStyle: string | null;
  venuePreference: string | null;
  mustHavesNotes: string | null;
  servicesAlreadyBooked: string | null;
  culturalOrReligiousNotes: string | null;
  briefCompletedAt: string | null;
  isBriefComplete: boolean;
  briefCompletionPercent: number;
}

export interface UpdateEventBriefPayload {
  estimatedGuestCount?: number | null;
  guestCountMax?: number | null;
  weddingStyle?: string | null;
  venuePreference?: string | null;
  mustHavesNotes?: string | null;
  servicesAlreadyBooked?: string | null;
  culturalOrReligiousNotes?: string | null;
  markBriefComplete?: boolean;
}

function mapEventBrief(raw: Record<string, unknown>): EventBrief {
  return {
    eventId: String(raw.eventId ?? raw.EventId ?? ""),
    eventName: String(raw.eventName ?? raw.EventName ?? ""),
    eventDate: String(raw.eventDate ?? raw.EventDate ?? ""),
    totalBudget: Number(raw.totalBudget ?? raw.TotalBudget ?? 0),
    taskPlanPhase: String(raw.taskPlanPhase ?? raw.TaskPlanPhase ?? "None") as TaskPlanPhase,
    eventLifecycleStage: String(raw.eventLifecycleStage ?? raw.EventLifecycleStage ?? "Lead"),
    estimatedGuestCount:
      raw.estimatedGuestCount != null || raw.EstimatedGuestCount != null
        ? Number(raw.estimatedGuestCount ?? raw.EstimatedGuestCount)
        : null,
    guestCountMax:
      raw.guestCountMax != null || raw.GuestCountMax != null
        ? Number(raw.guestCountMax ?? raw.GuestCountMax)
        : null,
    weddingStyle:
      raw.weddingStyle != null || raw.WeddingStyle != null
        ? String(raw.weddingStyle ?? raw.WeddingStyle)
        : null,
    venuePreference:
      raw.venuePreference != null || raw.VenuePreference != null
        ? String(raw.venuePreference ?? raw.VenuePreference)
        : null,
    mustHavesNotes:
      raw.mustHavesNotes != null || raw.MustHavesNotes != null
        ? String(raw.mustHavesNotes ?? raw.MustHavesNotes)
        : null,
    servicesAlreadyBooked:
      raw.servicesAlreadyBooked != null || raw.ServicesAlreadyBooked != null
        ? String(raw.servicesAlreadyBooked ?? raw.ServicesAlreadyBooked)
        : null,
    culturalOrReligiousNotes:
      raw.culturalOrReligiousNotes != null || raw.CulturalOrReligiousNotes != null
        ? String(raw.culturalOrReligiousNotes ?? raw.CulturalOrReligiousNotes)
        : null,
    briefCompletedAt:
      raw.briefCompletedAt != null || raw.BriefCompletedAt != null
        ? String(raw.briefCompletedAt ?? raw.BriefCompletedAt)
        : null,
    isBriefComplete: Boolean(raw.isBriefComplete ?? raw.IsBriefComplete),
    briefCompletionPercent: Number(raw.briefCompletionPercent ?? raw.BriefCompletionPercent ?? 0),
  };
}

export const WEDDING_STYLE_OPTIONS = [
  "Traditional Sri Lankan",
  "Western / White wedding",
  "Garden / Outdoor",
  "Destination wedding",
  "Multi-day celebration",
  "Intimate / Micro wedding",
  "Fusion / Cultural blend",
] as const;

export async function getEventBrief(token: string, eventId: string): Promise<EventBrief> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/brief`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to load event brief."));
  }
  const data = await response.json();
  return mapEventBrief(data as Record<string, unknown>);
}

export async function updateEventBrief(
  token: string,
  eventId: string,
  payload: UpdateEventBriefPayload
): Promise<EventBrief> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/brief`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );
  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to save event brief."));
  }
  const data = await response.json();
  return mapEventBrief(data as Record<string, unknown>);
}
