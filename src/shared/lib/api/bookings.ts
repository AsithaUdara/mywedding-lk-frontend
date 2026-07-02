import { apiRequest, apiRequestJson } from "@/shared/lib/api/apiRequest";
import { acceptVendorBooking } from "@/shared/lib/api/vendorShortlist";

export { acceptVendorBooking };

export interface EventBooking {
  bookingId: string;
  serviceName: string;
  vendorName?: string;
  vendorUserId?: string | null;
  serviceId?: string;
  finalAmount: number;
  status: string;
  serviceDate: string;
}

export async function getEventBookings(
  token: string,
  eventId: string
): Promise<EventBooking[]> {
  const data = await apiRequestJson<unknown[]>(
    token,
    `/api/bookings/event/${eventId}`,
    { method: "GET" },
    { fallbackError: "Failed to load event bookings." }
  );
  return (Array.isArray(data) ? data : []).map((row) => {
    const r = row as Record<string, unknown>;
    return {
    bookingId: String(r.bookingId ?? r.BookingId ?? r.id ?? r.Id ?? ""),
    serviceName: String(r.serviceName ?? r.ServiceName ?? "Service"),
    vendorName: String(r.vendorName ?? r.VendorName ?? ""),
    vendorUserId:
      r.vendorUserId != null ? String(r.vendorUserId ?? r.VendorUserId) : null,
    serviceId: String(r.serviceId ?? r.ServiceId ?? ""),
    finalAmount: Number(r.finalAmount ?? r.FinalAmount ?? 0),
    status: String(r.status ?? r.Status ?? ""),
    serviceDate: String(r.serviceDate ?? r.ServiceDate ?? ""),
    };
  });
}

export async function updateBookingStatus(
  token: string,
  bookingId: string,
  status: string
): Promise<void> {
  await apiRequest(
    token,
    `/api/bookings/${bookingId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
    { fallbackError: "Failed to update booking status." }
  );
}
