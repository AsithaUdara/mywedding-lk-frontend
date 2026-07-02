import { apiUrl } from "@/shared/lib/api/apiRequest";
import { parseApiError } from "@/shared/lib/api/parseApiError";
import { plannerFetch } from "@/shared/lib/api/plannerHttp";
import { apiRequest } from "@/shared/lib/api/apiRequest";

export type VendorShortlistItemStatus =
  | "Draft"
  | "SentToClient"
  | "ClientApproved"
  | "ClientRejected"
  | "BookingRequested"
  | "BookingAccepted"
  | "Declined"
  | "DepositPaid"
  | "ContractSigned";

export interface VendorShortlistItem {
  id: string;
  vendorServiceId: string;
  vendorUserId: string | null;
  serviceName: string | null;
  vendorBusinessName: string | null;
  categoryLabel: string | null;
  plannerNotes: string | null;
  status: VendorShortlistItemStatus;
  proposedAmount: number;
  serviceDate: string | null;
  vendorBookingId: string | null;
  sentToClientAt: string | null;
  clientApprovedAt: string | null;
  contractFileUrl: string | null;
  contractSentAt: string | null;
  contractSignedAt: string | null;
  bookingStatus: string | null;
}

export interface CreateShortlistItemPayload {
  vendorServiceId: string;
  categoryLabel?: string;
  plannerNotes?: string;
  proposedAmount: number;
  serviceDate?: string;
}

function mapItem(raw: Record<string, unknown>): VendorShortlistItem {
  return {
    id: String(raw.id ?? raw.Id ?? ""),
    vendorServiceId: String(raw.vendorServiceId ?? raw.VendorServiceId ?? ""),
    vendorUserId:
      raw.vendorUserId != null
        ? String(raw.vendorUserId ?? raw.VendorUserId)
        : null,
    serviceName:
      raw.serviceName != null
        ? String(raw.serviceName ?? raw.ServiceName)
        : null,
    vendorBusinessName:
      raw.vendorBusinessName != null
        ? String(raw.vendorBusinessName ?? raw.VendorBusinessName)
        : null,
    categoryLabel:
      raw.categoryLabel != null ? String(raw.categoryLabel ?? raw.CategoryLabel) : null,
    plannerNotes:
      raw.plannerNotes != null ? String(raw.plannerNotes ?? raw.PlannerNotes) : null,
    status: String(raw.status ?? raw.Status ?? "Draft") as VendorShortlistItemStatus,
    proposedAmount: Number(raw.proposedAmount ?? raw.ProposedAmount ?? 0),
    serviceDate:
      raw.serviceDate != null ? String(raw.serviceDate ?? raw.ServiceDate) : null,
    vendorBookingId:
      raw.vendorBookingId != null
        ? String(raw.vendorBookingId ?? raw.VendorBookingId)
        : null,
    sentToClientAt:
      raw.sentToClientAt != null
        ? String(raw.sentToClientAt ?? raw.SentToClientAt)
        : null,
    clientApprovedAt:
      raw.clientApprovedAt != null
        ? String(raw.clientApprovedAt ?? raw.ClientApprovedAt)
        : null,
    contractFileUrl:
      raw.contractFileUrl != null
        ? String(raw.contractFileUrl ?? raw.ContractFileUrl)
        : null,
    contractSentAt:
      raw.contractSentAt != null
        ? String(raw.contractSentAt ?? raw.ContractSentAt)
        : null,
    contractSignedAt:
      raw.contractSignedAt != null
        ? String(raw.contractSignedAt ?? raw.ContractSignedAt)
        : null,
    bookingStatus:
      raw.bookingStatus != null ? String(raw.bookingStatus ?? raw.BookingStatus) : null,
  };
}


export async function getVendorShortlist(
  token: string,
  eventId: string
): Promise<VendorShortlistItem[]> {
  const response = await apiRequest(
    token,
    `/api/events/${eventId}/vendor-shortlist`,
    { method: "GET" },
    { fallbackError: "Failed to load vendor proposals." }
  );
  const data = await response.json();
  return (Array.isArray(data) ? data : []).map((row) =>
    mapItem(row as Record<string, unknown>)
  );
}

export async function createVendorShortlist(
  token: string,
  eventId: string,
  payload: {
    sendToClient: boolean;
    items: CreateShortlistItemPayload[];
  }
): Promise<string[]> {
  const response = await plannerFetch(
    token,
    `${apiUrl(`/api/planner/events/${eventId}/vendor-shortlist`)}`,
    {
      method: "POST",
      body: JSON.stringify({
        sendToClient: payload.sendToClient,
        items: payload.items.map((i) => ({
          vendorServiceId: i.vendorServiceId,
          categoryLabel: i.categoryLabel ?? null,
          plannerNotes: i.plannerNotes ?? null,
          proposedAmount: i.proposedAmount,
          serviceDate: i.serviceDate ?? null,
        })),
      }),
    }
  );
  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to add vendor proposal."));
  }
  const data = (await response.json()) as { itemIds?: string[] };
  return data.itemIds ?? [];
}

export async function sendShortlistToClient(
  token: string,
  eventId: string,
  itemIds?: string[]
): Promise<void> {
  const response = await plannerFetch(
    token,
    apiUrl(`/api/planner/events/${eventId}/vendor-shortlist/send`),
    {
      method: "POST",
      body: JSON.stringify(itemIds?.length ? { itemIds } : {}),
    }
  );
  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to send proposals to client."));
  }
}

export async function approveShortlistItem(
  token: string,
  eventId: string,
  itemId: string,
  reject = false
): Promise<void> {
  await apiRequest(
    token,
    `/api/events/${eventId}/vendor-shortlist/${itemId}/approve`,
    {
      method: "POST",
      body: JSON.stringify({ reject }),
    },
    {
      fallbackError: reject ? "Failed to decline proposal." : "Failed to approve proposal.",
    }
  );
}

export async function requestBookingFromShortlist(
  token: string,
  eventId: string,
  itemId: string
): Promise<string> {
  const response = await apiRequest(
    token,
    `/api/events/${eventId}/vendor-shortlist/${itemId}/request-booking`,
    { method: "POST" },
    { fallbackError: "Failed to request booking." }
  );
  const data = (await response.json()) as { bookingId?: string };
  return String(data.bookingId ?? "");
}

export async function acceptVendorBooking(token: string, bookingId: string): Promise<void> {
  await apiRequest(
    token,
    `/api/bookings/${bookingId}/accept`,
    { method: "POST" },
    { fallbackError: "Failed to accept booking." }
  );
}

export async function declineVendorBooking(token: string, bookingId: string): Promise<void> {
  await apiRequest(
    token,
    `/api/bookings/${bookingId}/decline`,
    { method: "POST" },
    { fallbackError: "Failed to decline booking." }
  );
}
