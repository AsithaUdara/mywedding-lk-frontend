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

export interface AdminVendorSummary {
  total: number;
  verified: number;
  pending: number;
  rejected: number;
  liveListings: number;
  categories: number;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export type AdminVendorDirectoryParams = {
  page?: number;
  pageSize?: number;
  status?: AdminVendorStatusFilter | "All";
  search?: string;
};

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

export interface PayoutDueSummary {
  count: number;
  totalGross: number;
  totalCommission: number;
  totalVendorNet: number;
}

export type PayoutDueParams = {
  page?: number;
  pageSize?: number;
  search?: string;
};

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

export async function getAdminVendorSummary(token: string): Promise<AdminVendorSummary> {
  const res = await adminFetch(token, "/api/admin/vendors/summary");
  const data = await res.json();
  return {
    total: Number(data.total ?? data.Total ?? 0),
    verified: Number(data.verified ?? data.Verified ?? 0),
    pending: Number(data.pending ?? data.Pending ?? 0),
    rejected: Number(data.rejected ?? data.Rejected ?? 0),
    liveListings: Number(data.liveListings ?? data.LiveListings ?? 0),
    categories: Number(data.categories ?? data.Categories ?? 0),
  };
}

function mapPagedResult<T>(
  data: Record<string, unknown>,
  mapItem: (row: Record<string, unknown>) => T
): PagedResult<T> {
  const rawItems = data.items ?? data.Items;
  const items = Array.isArray(rawItems)
    ? rawItems.map((row) => mapItem(row as Record<string, unknown>))
    : [];

  const page = Number(data.page ?? data.Page ?? 1);
  const pageSize = Number(data.pageSize ?? data.PageSize ?? 10);
  const totalCount = Number(data.totalCount ?? data.TotalCount ?? 0);
  const totalPagesRaw = Number(data.totalPages ?? data.TotalPages ?? 0);

  return {
    items,
    page,
    pageSize,
    totalCount,
    totalPages: totalPagesRaw > 0 ? totalPagesRaw : pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0,
  };
}

export async function getAdminVendorsPage(
  token: string,
  params: AdminVendorDirectoryParams = {}
): Promise<PagedResult<AdminVendor>> {
  const search = new URLSearchParams();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  search.set("page", String(page));
  search.set("pageSize", String(pageSize));

  if (params.status && params.status !== "All") {
    search.set("status", params.status);
  }
  if (params.search?.trim()) {
    search.set("search", params.search.trim());
  }

  const res = await adminFetch(token, `/api/admin/vendors?${search.toString()}`);
  const data = await res.json();
  return mapPagedResult(data as Record<string, unknown>, mapAdminVendor);
}

/** @deprecated Use getAdminVendorsPage for paginated directory views. */
export async function getAdminVendors(
  token: string,
  status?: AdminVendorStatusFilter
): Promise<AdminVendor[]> {
  const result = await getAdminVendorsPage(token, { status, page: 1, pageSize: 50 });
  return result.items;
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

export async function getPayoutDueSummary(token: string): Promise<PayoutDueSummary> {
  const res = await adminFetch(token, "/api/admin/commissions/payout-due/summary");
  const data = await res.json();
  return {
    count: Number(data.count ?? data.Count ?? 0),
    totalGross: Number(data.totalGross ?? data.TotalGross ?? 0),
    totalCommission: Number(data.totalCommission ?? data.TotalCommission ?? 0),
    totalVendorNet: Number(data.totalVendorNet ?? data.TotalVendorNet ?? 0),
  };
}

export async function getPayoutDuePage(
  token: string,
  params: PayoutDueParams = {}
): Promise<PagedResult<PayoutDueItem>> {
  const search = new URLSearchParams();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  search.set("page", String(page));
  search.set("pageSize", String(pageSize));
  if (params.search?.trim()) {
    search.set("search", params.search.trim());
  }

  const res = await adminFetch(token, `/api/admin/commissions/payout-due?${search.toString()}`);
  const data = await res.json();
  return mapPagedResult(data as Record<string, unknown>, mapPayoutDueItem);
}

/** @deprecated Use getPayoutDuePage or getPayoutDueSummary. */
export async function getPayoutDue(token: string): Promise<PayoutDueItem[]> {
  const result = await getPayoutDuePage(token, { page: 1, pageSize: 50 });
  return result.items;
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
