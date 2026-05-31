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
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events`;
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch events.');
  const data = await response.json();
  return (Array.isArray(data) ? data : []).map((row) =>
    mapEventSummary(row as Record<string, unknown>)
  );
};

export const createEvent = async (token: string, eventData: { eventName: string; eventDate: string; }) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events`;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create event.');
  }
  return response.json();
};

export const getEventById = async (token: string, eventId: string) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}`;
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch event details.');
  }
  return response.json();
};

export const getOrganizers = async (token: string, eventId: string): Promise<Organizer[]> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/organizers`;
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch event organizers.');
  const data = await response.json();
  return (Array.isArray(data) ? data : []).map((row) =>
    mapOrganizer(row as Record<string, unknown>)
  );
};

export const inviteOrganizer = async (token: string, eventId: string, inviteData: InviteData) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/organizers`;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(inviteData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to send invitation.');
  }
  return response.json();
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
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/invitations`;
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch invitations.');
  return response.json();
};

export const updateOrganizerRole = async (token: string, eventId: string, userId: string, data: { role: string; permissionLevel: string }) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/organizers/${userId}`;
  const response = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update member.');
  }
  return response.json();
};

