import { parsePlannerApiError, PlannerSubscriptionLimitError } from "@/modules/planner/subscription/errors";
import { plannerFetch } from "@/shared/lib/api/plannerHttp";

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
  agencyLogoUrl?: string | null;
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
  subscriptionMonthlyFee: number;
  subscriptionEndsAt?: string | null;
  subscriptionStartsAt?: string | null;
}

export interface PlannerBillingProfile {
  hasPaymentMethod: boolean;
  cardholderName?: string;
  cardBrand?: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  updatedAt?: string;
}

export interface PlannerClientItem {
  clientUserId: string;
  clientEmail: string;
  totalEvents: number;
  activeEvents: number;
  lastActivityAt: string;
}

export type EventLifecycleStage = "Lead" | "Onboarding" | "Planning" | "Execution" | "Archived";
export type TaskPlanPhase = "None" | "Discovery" | "Full";

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
  eventLifecycleStage: EventLifecycleStage;
  taskPlanPhase: TaskPlanPhase;
}

export type EventTaskSeedMode = "Manual" | "DiscoveryStarter" | "MasterChecklist" | "CustomTemplate";

export interface CreatePlannerEventPayload {
  eventName: string;
  eventDate: string;
  totalBudget: number;
  clientUserId?: string;
  clientEmail?: string;
  taskSeedMode?: EventTaskSeedMode;
  customTemplateId?: string;
}

export interface CreatePlannerEventResult {
  eventId: string;
  plannerClientEventId?: string;
  tasksGenerated: number;
  eventName?: string;
  taskSeedMode?: EventTaskSeedMode;
}

export interface PlannerBookingListItem {
  bookingId: string;
  eventId: string;
  eventName: string;
  serviceName: string;
  vendorName: string;
  bookingStatus: string;
  paymentStatus: string;
  finalAmount: number;
  createdAt: string;
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

function mapPlannerUpcomingEvent(raw: Record<string, unknown>) {
  return {
    eventId: String(raw.eventId ?? raw.EventId ?? ""),
    eventName: String(raw.eventName ?? raw.EventName ?? ""),
    eventDate: String(raw.eventDate ?? raw.EventDate ?? ""),
    clientEmail: String(raw.clientEmail ?? raw.ClientEmail ?? ""),
    status: String(raw.status ?? raw.Status ?? ""),
    totalBudget: Number(raw.totalBudget ?? raw.TotalBudget ?? 0),
  };
}

function mapPlannerOverview(raw: Record<string, unknown>): PlannerOverviewResponse {
  const rawUpcoming = raw.upcomingEvents ?? raw.UpcomingEvents;
  const upcoming = Array.isArray(rawUpcoming) ? rawUpcoming : [];
  return {
    plannerId: String(raw.plannerId ?? raw.PlannerId ?? ""),
    plannerName: String(raw.plannerName ?? raw.PlannerName ?? ""),
    businessName: String(raw.businessName ?? raw.BusinessName ?? ""),
    businessDescription:
      raw.businessDescription != null || raw.BusinessDescription != null
        ? String(raw.businessDescription ?? raw.BusinessDescription)
        : undefined,
    city:
      raw.city != null || raw.City != null ? String(raw.city ?? raw.City) : undefined,
    activePlanTier: String(raw.activePlanTier ?? raw.ActivePlanTier ?? "Free"),
    maxConcurrentEvents: Number(raw.maxConcurrentEvents ?? raw.MaxConcurrentEvents ?? 1),
    activeWeddings: Number(raw.activeWeddings ?? raw.ActiveWeddings ?? 0),
    pendingBookings: Number(raw.pendingBookings ?? raw.PendingBookings ?? 0),
    confirmedBookings: Number(raw.confirmedBookings ?? raw.ConfirmedBookings ?? 0),
    upcomingEvents: upcoming.map((row) =>
      mapPlannerUpcomingEvent(row as Record<string, unknown>)
    ),
    subscriptionMonthlyFee: Number(
      raw.subscriptionMonthlyFee ?? raw.SubscriptionMonthlyFee ?? 0
    ),
    subscriptionEndsAt:
      raw.subscriptionEndsAt != null || raw.SubscriptionEndsAt != null
        ? String(raw.subscriptionEndsAt ?? raw.SubscriptionEndsAt)
        : null,
    subscriptionStartsAt:
      raw.subscriptionStartsAt != null || raw.SubscriptionStartsAt != null
        ? String(raw.subscriptionStartsAt ?? raw.SubscriptionStartsAt)
        : null,
  };
}

function mapPlannerEventListItem(raw: Record<string, unknown>): PlannerEventListItem {
  const stage = String(
    raw.eventLifecycleStage ?? raw.EventLifecycleStage ?? "Planning"
  ) as EventLifecycleStage;
  const taskPlanPhase = String(
    raw.taskPlanPhase ?? raw.TaskPlanPhase ?? "None"
  ) as TaskPlanPhase;
  return {
    plannerClientEventId: String(raw.plannerClientEventId ?? raw.PlannerClientEventId ?? ""),
    eventId: String(raw.eventId ?? raw.EventId ?? ""),
    eventName: String(raw.eventName ?? raw.EventName ?? ""),
    eventDate: String(raw.eventDate ?? raw.EventDate ?? ""),
    clientUserId: String(raw.clientUserId ?? raw.ClientUserId ?? ""),
    clientEmail: String(raw.clientEmail ?? raw.ClientEmail ?? ""),
    status: String(raw.status ?? raw.Status ?? ""),
    totalBudget: Number(raw.totalBudget ?? raw.TotalBudget ?? 0),
    spentBudget: Number(raw.spentBudget ?? raw.SpentBudget ?? 0),
    requestedBookings: Number(raw.requestedBookings ?? raw.RequestedBookings ?? 0),
    confirmedBookings: Number(raw.confirmedBookings ?? raw.ConfirmedBookings ?? 0),
    completedBookings: Number(raw.completedBookings ?? raw.CompletedBookings ?? 0),
    eventLifecycleStage: stage,
    taskPlanPhase,
  };
}

function mapPlannerClient(raw: Record<string, unknown>): PlannerClientItem {
  return {
    clientUserId: String(raw.clientUserId ?? raw.ClientUserId ?? ""),
    clientEmail: String(raw.clientEmail ?? raw.ClientEmail ?? ""),
    totalEvents: Number(raw.totalEvents ?? raw.TotalEvents ?? 0),
    activeEvents: Number(raw.activeEvents ?? raw.ActiveEvents ?? 0),
    lastActivityAt: String(raw.lastActivityAt ?? raw.LastActivityAt ?? ""),
  };
}

function mapPlannerDashboard(raw: Record<string, unknown>): PlannerDashboardResponse {
  return {
    plannerId: String(raw.plannerId ?? raw.PlannerId ?? ""),
    plannerName: String(raw.plannerName ?? raw.PlannerName ?? ""),
    businessName: String(raw.businessName ?? raw.BusinessName ?? ""),
    businessDescription:
      raw.businessDescription != null || raw.BusinessDescription != null
        ? String(raw.businessDescription ?? raw.BusinessDescription)
        : undefined,
    contactPhone:
      raw.contactPhone != null || raw.ContactPhone != null
        ? String(raw.contactPhone ?? raw.ContactPhone)
        : undefined,
    city:
      raw.city != null || raw.City != null ? String(raw.city ?? raw.City) : undefined,
    activePlanTier: String(raw.activePlanTier ?? raw.ActivePlanTier ?? "Free"),
    maxConcurrentEvents: Number(raw.maxConcurrentEvents ?? raw.MaxConcurrentEvents ?? 1),
    events: (() => {
      const rawEvents = raw.events ?? raw.Events;
      const list = Array.isArray(rawEvents) ? rawEvents : [];
      return list;
    })().map((e: unknown) => {
      const row = e as Record<string, unknown>;
      return {
        plannerClientEventId: String(row.plannerClientEventId ?? row.PlannerClientEventId ?? ""),
        eventId: String(row.eventId ?? row.EventId ?? ""),
        eventName: String(row.eventName ?? row.EventName ?? ""),
        eventDate: String(row.eventDate ?? row.EventDate ?? ""),
        clientUserId: String(row.clientUserId ?? row.ClientUserId ?? ""),
        clientEmail: String(row.clientEmail ?? row.ClientEmail ?? ""),
        status: String(row.status ?? row.Status ?? ""),
      };
    }),
    agencyLogoUrl:
      raw.agencyLogoUrl != null || raw.AgencyLogoUrl != null
        ? String(raw.agencyLogoUrl ?? raw.AgencyLogoUrl)
        : null,
  };
}

export async function getPlannerDashboard(token: string): Promise<PlannerDashboardResponse> {
  const res = await fetch(`${BASE}/api/planner/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to load planner dashboard.");
  }
  const data = await res.json();
  return mapPlannerDashboard(data as Record<string, unknown>);
}

export async function updatePlannerAgencyLogo(
  token: string,
  agencyLogoUrl: string
): Promise<{ agencyLogoUrl: string }> {
  const res = await fetch(`${BASE}/api/planner/profile/agency-logo`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ agencyLogoUrl }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      String((err as { message?: string }).message ?? "Failed to save agency logo.")
    );
  }
  return res.json();
}

export async function createPlannerEvent(
  token: string,
  payload: CreatePlannerEventPayload
): Promise<CreatePlannerEventResult> {
  const res = await plannerFetch(token, `${BASE}/api/planner/events`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    const limitError = parsePlannerApiError(err);
    if (limitError) throw limitError;
    throw new Error(String(err.message ?? err.detail ?? "Failed to create planner event."));
  }
  const data = (await res.json()) as Record<string, unknown>;
  return {
    eventId: String(data.eventId ?? data.EventId ?? ""),
    plannerClientEventId: String(data.plannerClientEventId ?? data.PlannerClientEventId ?? ""),
    tasksGenerated: Number(data.tasksGenerated ?? data.TasksGenerated ?? 0),
    taskSeedMode: (data.taskSeedMode ?? data.TaskSeedMode) as EventTaskSeedMode | undefined,
  };
}

export { PlannerSubscriptionLimitError };

export async function createPlannerSubscriptionCheckout(
  token: string,
  payload: { tier: "PlannerPro"; monthlyFee: number }
) {
  const res = await fetch(`${BASE}/api/payments/planner-subscription/checkout`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to start planner subscription checkout.");
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

export async function getPlannerBillingProfile(token: string): Promise<PlannerBillingProfile> {
  const res = await fetch(`${BASE}/api/planner/billing-profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to load billing profile.");
  }
  const data = (await res.json()) as Record<string, unknown>;
  return {
    hasPaymentMethod: Boolean(data.hasPaymentMethod ?? data.HasPaymentMethod),
    cardholderName:
      data.cardholderName != null || data.CardholderName != null
        ? String(data.cardholderName ?? data.CardholderName)
        : undefined,
    cardBrand:
      data.cardBrand != null || data.CardBrand != null
        ? String(data.cardBrand ?? data.CardBrand)
        : undefined,
    last4:
      data.last4 != null || data.Last4 != null
        ? String(data.last4 ?? data.Last4)
        : undefined,
    expiryMonth:
      data.expiryMonth != null || data.ExpiryMonth != null
        ? Number(data.expiryMonth ?? data.ExpiryMonth)
        : undefined,
    expiryYear:
      data.expiryYear != null || data.ExpiryYear != null
        ? Number(data.expiryYear ?? data.ExpiryYear)
        : undefined,
    updatedAt:
      data.updatedAt != null || data.UpdatedAt != null
        ? String(data.updatedAt ?? data.UpdatedAt)
        : undefined,
  };
}

export async function savePlannerBillingProfile(
  token: string,
  payload: {
    cardholderName: string;
    cardBrand: string;
    last4: string;
    expiryMonth?: number;
    expiryYear?: number;
  }
) {
  const res = await fetch(`${BASE}/api/planner/billing-profile`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to save billing profile.");
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
  const data = await res.json();
  return mapPlannerOverview(data as Record<string, unknown>);
}

export async function getPlannerClients(token: string): Promise<PlannerClientItem[]> {
  const res = await plannerFetch(token, `${BASE}/api/planner/clients`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to load planner clients.");
  }
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map((row) =>
    mapPlannerClient(row as Record<string, unknown>)
  );
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
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map((row) =>
    mapPlannerEventListItem(row as Record<string, unknown>)
  );
}

export async function updatePlannerEventStage(
  token: string,
  eventId: string,
  stage: EventLifecycleStage
): Promise<void> {
  const res = await plannerFetch(token, `${BASE}/api/planner/events/${eventId}/stage`, {
    method: "PATCH",
    body: JSON.stringify({ stage }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.detail || "Failed to update event stage.");
  }
}

export async function updatePlannerProfile(
  token: string,
  payload: { businessName: string; businessDescription?: string; contactPhone?: string; city?: string }
) {
  const res = await plannerFetch(token, `${BASE}/api/planner/profile`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update planner profile.");
  }
  return res.json();
}

function mapPlannerBooking(raw: Record<string, unknown>): PlannerBookingListItem {
  return {
    bookingId: String(raw.bookingId ?? raw.BookingId ?? ""),
    eventId: String(raw.eventId ?? raw.EventId ?? ""),
    eventName: String(raw.eventName ?? raw.EventName ?? ""),
    serviceName: String(raw.serviceName ?? raw.ServiceName ?? ""),
    vendorName: String(raw.vendorName ?? raw.VendorName ?? ""),
    bookingStatus: String(raw.bookingStatus ?? raw.BookingStatus ?? ""),
    paymentStatus: String(raw.paymentStatus ?? raw.PaymentStatus ?? "None"),
    finalAmount: Number(raw.finalAmount ?? raw.FinalAmount ?? 0),
    createdAt: String(raw.createdAt ?? raw.CreatedAt ?? ""),
  };
}

export async function getPlannerBookings(token: string): Promise<PlannerBookingListItem[]> {
  const res = await plannerFetch(token, `${BASE}/api/planner/bookings`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      String((err as { message?: string }).message ?? "Failed to load planner bookings.")
    );
  }
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map((row) =>
    mapPlannerBooking(row as Record<string, unknown>)
  );
}
