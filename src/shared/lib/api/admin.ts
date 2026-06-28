import { apiFetch, getApiBaseUrl } from "@/shared/lib/api/apiClient";
import { parseApiError } from "@/shared/lib/api/parseApiError";

export interface PendingVendor {
  userId: string;
  businessName: string;
  businessDescription: string | null;
  city: string | null;
  categoryName: string | null;
  ownerEmail: string | null;
  ownerName: string | null;
  verificationStatus: string;
}

export type AdminVendorStatusFilter = "Verified" | "Pending" | "Rejected";

export interface AdminVendor {
  userId: string;
  businessName: string;
  businessDescription: string | null;
  city: string | null;
  categoryName: string | null;
  ownerEmail: string | null;
  ownerName: string | null;
  verificationStatus: string;
  activeServiceCount: number;
  averageRating: number;
  registeredAt: string;
  subscriptionTier: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalVendors: number;
  totalEvents: number;
  totalBookings: number;
}

export interface PlatformAnalytics {
  mrr: number;
  mrrDeltaPct: number;
  tpv: number;
  tpvDeltaPct: number;
  takeRateRevenue: number;
  activePlanners: number;
  activeCouples: number;
  registeredVendors: number;
  totalUsers: number;
  totalEvents: number;
  totalBookings: number;
  usersWithEvents: number;
  usersWithBookings: number;
  eventsWithBookings: number;
  plannerGrowthByMonth: Array<{ month: string; count: number }>;
}

export interface PayoutDueItem {
  id: string;
  bookingId: string;
  grossAmount: number;
  commissionAmount: number;
  vendorNetAmount: number;
  createdAt: string;
  serviceId: string;
  eventId: string;
}

async function adminFetch(
  token: string,
  path: string,
  init?: RequestInit
): Promise<Response> {
  const response = await apiFetch(token, `${getApiBaseUrl()}${path}`, init);
  if (!response.ok) {
    throw new Error(await parseApiError(response, "Admin API request failed."));
  }
  return response;
}

export async function getPendingVendors(token: string): Promise<PendingVendor[]> {
  const res = await adminFetch(token, "/api/admin/vendors/pending");
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map((row) => mapPendingVendor(row as Record<string, unknown>));
}

function mapPendingVendor(raw: Record<string, unknown>): PendingVendor {
  return {
    userId: String(raw.userId ?? raw.UserId ?? ""),
    businessName: String(raw.businessName ?? raw.BusinessName ?? ""),
    businessDescription:
      raw.businessDescription != null || raw.BusinessDescription != null
        ? String(raw.businessDescription ?? raw.BusinessDescription)
        : null,
    city: raw.city != null || raw.City != null ? String(raw.city ?? raw.City) : null,
    categoryName:
      raw.categoryName != null || raw.CategoryName != null
        ? String(raw.categoryName ?? raw.CategoryName)
        : null,
    ownerEmail:
      raw.ownerEmail != null || raw.OwnerEmail != null
        ? String(raw.ownerEmail ?? raw.OwnerEmail)
        : null,
    ownerName:
      raw.ownerName != null || raw.OwnerName != null
        ? String(raw.ownerName ?? raw.OwnerName)
        : null,
    verificationStatus: String(raw.verificationStatus ?? raw.VerificationStatus ?? "Pending"),
  };
}

function mapAdminVendor(raw: Record<string, unknown>): AdminVendor {
  return {
    userId: String(raw.userId ?? raw.UserId ?? ""),
    businessName: String(raw.businessName ?? raw.BusinessName ?? ""),
    businessDescription:
      raw.businessDescription != null || raw.BusinessDescription != null
        ? String(raw.businessDescription ?? raw.BusinessDescription)
        : null,
    city: raw.city != null || raw.City != null ? String(raw.city ?? raw.City) : null,
    categoryName:
      raw.categoryName != null || raw.CategoryName != null
        ? String(raw.categoryName ?? raw.CategoryName)
        : null,
    ownerEmail:
      raw.ownerEmail != null || raw.OwnerEmail != null
        ? String(raw.ownerEmail ?? raw.OwnerEmail)
        : null,
    ownerName:
      raw.ownerName != null || raw.OwnerName != null
        ? String(raw.ownerName ?? raw.OwnerName)
        : null,
    verificationStatus: String(raw.verificationStatus ?? raw.VerificationStatus ?? "Pending"),
    activeServiceCount: Number(raw.activeServiceCount ?? raw.ActiveServiceCount ?? 0),
    averageRating: Number(raw.averageRating ?? raw.AverageRating ?? 0),
    registeredAt: String(raw.registeredAt ?? raw.RegisteredAt ?? ""),
    subscriptionTier: String(raw.subscriptionTier ?? raw.SubscriptionTier ?? "Free"),
  };
}

export async function getAdminVendors(
  token: string,
  status?: AdminVendorStatusFilter
): Promise<AdminVendor[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  const res = await adminFetch(token, `/api/admin/vendors${qs}`);
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map((row) => mapAdminVendor(row as Record<string, unknown>));
}

export async function verifyVendor(token: string, vendorId: string): Promise<void> {
  await adminFetch(token, `/api/admin/vendors/${vendorId}/verify`, { method: "PATCH" });
}

export async function rejectVendor(token: string, vendorId: string): Promise<void> {
  await adminFetch(token, `/api/admin/vendors/${vendorId}/reject`, { method: "PATCH" });
}

export async function getPlatformStats(token: string): Promise<PlatformStats> {
  const res = await adminFetch(token, "/api/admin/stats");
  return res.json();
}

export async function getPlatformAnalytics(token: string): Promise<PlatformAnalytics> {
  const res = await adminFetch(token, "/api/admin/platform-analytics");
  const data = await res.json();
  return {
    mrr: Number(data.mrr ?? data.Mrr ?? 0),
    mrrDeltaPct: Number(data.mrrDeltaPct ?? data.MrrDeltaPct ?? 0),
    tpv: Number(data.tpv ?? data.Tpv ?? 0),
    tpvDeltaPct: Number(data.tpvDeltaPct ?? data.TpvDeltaPct ?? 0),
    takeRateRevenue: Number(data.takeRateRevenue ?? data.TakeRateRevenue ?? 0),
    activePlanners: Number(data.activePlanners ?? data.ActivePlanners ?? 0),
    activeCouples: Number(data.activeCouples ?? data.ActiveCouples ?? 0),
    registeredVendors: Number(data.registeredVendors ?? data.RegisteredVendors ?? 0),
    totalUsers: Number(data.totalUsers ?? data.TotalUsers ?? 0),
    totalEvents: Number(data.totalEvents ?? data.TotalEvents ?? 0),
    totalBookings: Number(data.totalBookings ?? data.TotalBookings ?? 0),
    usersWithEvents: Number(data.usersWithEvents ?? data.UsersWithEvents ?? 0),
    usersWithBookings: Number(data.usersWithBookings ?? data.UsersWithBookings ?? 0),
    eventsWithBookings: Number(data.eventsWithBookings ?? data.EventsWithBookings ?? 0),
    plannerGrowthByMonth: (data.plannerGrowthByMonth ?? data.PlannerGrowthByMonth ?? []).map(
      (p: Record<string, unknown>) => ({
        month: String(p.month ?? p.Month ?? ""),
        count: Number(p.count ?? p.Count ?? 0),
      })
    ),
  };
}

function mapPayoutDueItem(raw: Record<string, unknown>): PayoutDueItem {
  return {
    id: String(raw.id ?? raw.Id ?? ""),
    bookingId: String(raw.bookingId ?? raw.BookingId ?? ""),
    grossAmount: Number(raw.grossAmount ?? raw.GrossAmount ?? 0),
    commissionAmount: Number(raw.commissionAmount ?? raw.CommissionAmount ?? 0),
    vendorNetAmount: Number(raw.vendorNetAmount ?? raw.VendorNetAmount ?? 0),
    createdAt: String(raw.createdAt ?? raw.CreatedAt ?? ""),
    serviceId: String(raw.serviceId ?? raw.ServiceId ?? ""),
    eventId: String(raw.eventId ?? raw.EventId ?? ""),
  };
}

export async function getPayoutDue(token: string): Promise<PayoutDueItem[]> {
  const res = await adminFetch(token, "/api/admin/commissions/payout-due");
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map((row) =>
    mapPayoutDueItem(row as Record<string, unknown>)
  );
}

export interface AuditLogItem {
  id: string;
  actionType: string;
  content: string;
  metadataJson: string | null;
  timestampUtc: string;
  actorId: string;
  actorFirstName: string;
  actorLastName: string;
}

function mapAuditLogItem(raw: Record<string, unknown>): AuditLogItem {
  return {
    id: String(raw.id ?? raw.Id ?? ""),
    actionType: String(raw.actionType ?? raw.ActionType ?? ""),
    content: String(raw.content ?? raw.Content ?? ""),
    metadataJson:
      raw.metadataJson != null || raw.MetadataJson != null
        ? String(raw.metadataJson ?? raw.MetadataJson)
        : null,
    timestampUtc: String(raw.timestampUtc ?? raw.TimestampUtc ?? ""),
    actorId: String(raw.actorId ?? raw.ActorId ?? ""),
    actorFirstName: String(raw.actorFirstName ?? raw.ActorFirstName ?? ""),
    actorLastName: String(raw.actorLastName ?? raw.ActorLastName ?? ""),
  };
}

export async function getEventAuditLog(token: string, eventId: string): Promise<AuditLogItem[]> {
  const response = await apiFetch(token, `${getApiBaseUrl()}/api/events/${eventId}/audit-log`);
  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to fetch audit log."));
  }
  const data = await response.json();
  return (Array.isArray(data) ? data : []).map((row) =>
    mapAuditLogItem(row as Record<string, unknown>)
  );
}

export async function markPayoutSettled(token: string, settlementId: string): Promise<void> {
  await adminFetch(token, `/api/admin/commissions/${settlementId}/mark-settled`, {
    method: "PATCH",
  });
}
