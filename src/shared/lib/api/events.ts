import { apiFetch } from "@/shared/lib/api/apiClient";
import { apiRequestJson, apiUrl } from "@/shared/lib/api/apiRequest";
import { parseApiError } from "@/shared/lib/api/parseApiError";

export interface WeddingEventSummary {
  id: string;
  eventName: string;
  eventDate: string;
  createdById?: string;
  totalBudget?: number;
  /** True when the current user may book vendors (owner or editor, not viewer). */
  canBook?: boolean;
}

export interface EventPlannerBranding {
  businessName: string;
  displayName: string;
  agencyLogoUrl?: string | null;
  isWhiteLabeled: boolean;
}

export interface EventDetail extends WeddingEventSummary {
  plannerBranding?: EventPlannerBranding | null;
}

export interface Organizer {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissionLevel: string;
}

function mapOrganizer(raw: Record<string, unknown>): Organizer {
  return {
    userId: String(raw.userId ?? raw.UserId ?? ""),
    email: String(raw.email ?? raw.Email ?? ""),
    firstName: String(raw.firstName ?? raw.FirstName ?? ""),
    lastName: String(raw.lastName ?? raw.LastName ?? ""),
    role: String(raw.role ?? raw.Role ?? ""),
    permissionLevel: String(raw.permissionLevel ?? raw.PermissionLevel ?? ""),
  };
}

export interface InviteData {
  email: string;
  role: string;
  permissionLevel: string;
}

function mapPlannerBranding(raw: Record<string, unknown> | null | undefined): EventPlannerBranding | null {
  if (!raw) return null;

  const businessName = String(raw.businessName ?? raw.BusinessName ?? "").trim();
  if (!businessName) return null;

  return {
    businessName,
    displayName: String(raw.displayName ?? raw.DisplayName ?? businessName),
    agencyLogoUrl:
      raw.agencyLogoUrl != null || raw.AgencyLogoUrl != null
        ? String(raw.agencyLogoUrl ?? raw.AgencyLogoUrl)
        : null,
    isWhiteLabeled: Boolean(raw.isWhiteLabeled ?? raw.IsWhiteLabeled),
  };
}

export function mapEventDetail(raw: Record<string, unknown>): EventDetail {
  const plannerRaw = (raw.plannerBranding ?? raw.PlannerBranding) as Record<string, unknown> | undefined;

  return {
    ...mapEventSummary(raw),
    plannerBranding: mapPlannerBranding(plannerRaw),
  };
}

function mapEventSummary(raw: Record<string, unknown>): WeddingEventSummary {
  return {
    id: String(raw.id ?? raw.Id ?? ""),
    eventName: String(raw.eventName ?? raw.EventName ?? ""),
    eventDate: String(raw.eventDate ?? raw.EventDate ?? ""),
    createdById:
      raw.createdById != null || raw.CreatedById != null
        ? String(raw.createdById ?? raw.CreatedById)
        : undefined,
    totalBudget:
      raw.totalBudget != null || raw.TotalBudget != null
        ? Number(raw.totalBudget ?? raw.TotalBudget)
        : undefined,
    canBook:
      raw.canBook != null || raw.CanBook != null
        ? Boolean(raw.canBook ?? raw.CanBook)
        : undefined,
  };
}

export const getEvents = async (token: string): Promise<WeddingEventSummary[]> => {
  const data = await apiRequestJson<unknown[]>(
    token,
    "/api/events",
    { method: "GET" },
    { fallbackError: "Failed to fetch events." }
  );
  return (Array.isArray(data) ? data : []).map((row) =>
    mapEventSummary(row as Record<string, unknown>)
  );
};

export const createEvent = async (
  token: string,
  eventData: { eventName: string; eventDate: string }
): Promise<{ id: string; eventId: string; eventName: string }> => {
  const data = await apiRequestJson<Record<string, unknown>>(
    token,
    "/api/events",
    {
      method: "POST",
      body: JSON.stringify(eventData),
    },
    { fallbackError: "Failed to create event." }
  );
  const id = String(data.id ?? data.Id ?? data.eventId ?? data.EventId ?? "");
  return {
    id,
    eventId: id,
    eventName: String(data.eventName ?? data.EventName ?? eventData.eventName),
  };
};

export const getEventById = async (token: string, eventId: string) => {
  const response = await apiFetch(token, apiUrl(`/api/events/${eventId}`), { method: "GET" });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to fetch event details."));
  }
  return response.json();
};

export const getOrganizers = async (token: string, eventId: string): Promise<Organizer[]> => {
  const data = await apiRequestJson<unknown[]>(
    token,
    `/api/events/${eventId}/organizers`,
    { method: "GET" },
    { fallbackError: "Failed to fetch event organizers." }
  );
  return (Array.isArray(data) ? data : []).map((row) =>
    mapOrganizer(row as Record<string, unknown>)
  );
};

export const inviteOrganizer = async (token: string, eventId: string, inviteData: InviteData) => {
  return apiRequestJson(
    token,
    `/api/events/${eventId}/organizers`,
    {
      method: "POST",
      body: JSON.stringify(inviteData),
    },
    { fallbackError: "Failed to send invitation." }
  );
};

export interface Invitation {
  id: string;
  email: string;
  invitedAt: string;
  isAccepted: boolean;
  acceptedAt?: string;
  isExpired: boolean;
}

export const getInvitations = async (token: string, eventId: string): Promise<Invitation[]> => {
  return apiRequestJson(
    token,
    `/api/events/${eventId}/invitations`,
    { method: "GET" },
    { fallbackError: "Failed to fetch invitations." }
  );
};

export const updateOrganizerRole = async (token: string, eventId: string, userId: string, data: { role: string; permissionLevel: string }) => {
  return apiRequestJson(
    token,
    `/api/events/${eventId}/organizers/${userId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    { fallbackError: "Failed to update member." }
  );
};
