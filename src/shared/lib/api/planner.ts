export interface PlannerSignupPayload {
  businessName: string;
  businessDescription?: string;
  contactPhone?: string;
  city?: string;
}

export interface PlannerClientEventSummary {
  plannerClientEventId: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  clientUserId: string;
  clientEmail: string;
  status: string;
}

export interface PlannerDashboardResponse {
  plannerId: string;
  plannerName: string;
  businessName: string;
  businessDescription?: string;
  contactPhone?: string;
  city?: string;
  activePlanTier: string;
  maxConcurrentEvents: number;
  events: PlannerClientEventSummary[];
}

export interface PlannerOverviewResponse {
  plannerId: string;
  plannerName: string;
  businessName: string;
  businessDescription?: string;
  city?: string;
  activePlanTier: string;
  maxConcurrentEvents: number;
  activeWeddings: number;
  pendingBookings: number;
  confirmedBookings: number;
  upcomingEvents: Array<{
    eventId: string;
    eventName: string;
    eventDate: string;
    clientEmail: string;
    status: string;
    totalBudget: number;
  }>;
}

export interface PlannerClientItem {
  clientUserId: string;
  clientEmail: string;
  totalEvents: number;
  activeEvents: number;
  lastActivityAt: string;
}

export interface PlannerEventListItem {
  plannerClientEventId: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  clientUserId: string;
  clientEmail: string;
  status: string;
  totalBudget: number;
  spentBudget: number;
  requestedBookings: number;
  confirmedBookings: number;
  completedBookings: number;
}

export interface CreatePlannerEventPayload {
  eventName: string;
  eventDate: string;
  totalBudget: number;
  clientUserId?: string;
  clientEmail?: string;
}

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export async function signupPlanner(token: string, payload: PlannerSignupPayload): Promise<void> {
  const res = await fetch(`${BASE}/api/planner/signup`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create planner profile.");
  }
}

export async function getPlannerDashboard(token: string): Promise<PlannerDashboardResponse> {
  const res = await fetch(`${BASE}/api/planner/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to load planner dashboard.");
  }
  return res.json();
}

export async function createPlannerEvent(token: string, payload: CreatePlannerEventPayload): Promise<{ eventId: string }> {
  const res = await fetch(`${BASE}/api/planner/events`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create planner event.");
  }
  return res.json();
}

export async function updatePlannerSubscription(token: string, payload: { tier: "Free" | "PlannerPro"; monthlyFee: number }) {
  const res = await fetch(`${BASE}/api/planner/subscription`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update planner subscription.");
  }
  return res.json();
}

export async function getPlannerOverview(token: string): Promise<PlannerOverviewResponse> {
  const res = await fetch(`${BASE}/api/planner/overview`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to load planner overview.");
  }
  return res.json();
}

export async function getPlannerClients(token: string): Promise<PlannerClientItem[]> {
  const res = await fetch(`${BASE}/api/planner/clients`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to load planner clients.");
  }
  return res.json();
}

export async function getPlannerEvents(token: string, status?: string): Promise<PlannerEventListItem[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const res = await fetch(`${BASE}/api/planner/events${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to load planner events.");
  }
  return res.json();
}

export async function updatePlannerProfile(
  token: string,
  payload: { businessName: string; businessDescription?: string; contactPhone?: string; city?: string }
) {
  const res = await fetch(`${BASE}/api/planner/profile`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update planner profile.");
  }
  return res.json();
}
