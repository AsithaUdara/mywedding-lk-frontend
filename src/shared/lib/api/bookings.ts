import { parseApiError } from "@/shared/lib/api/parseApiError";
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
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookings/event/${eventId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to load event bookings."));
  }
  const data = await response.json();
  return (Array.isArray(data) ? data : []).map((row: Record<string, unknown>) => ({
    bookingId: String(row.bookingId ?? row.BookingId ?? row.id ?? row.Id ?? ""),
    serviceName: String(row.serviceName ?? row.ServiceName ?? "Service"),
    vendorName: String(row.vendorName ?? row.VendorName ?? ""),
    vendorUserId:
      row.vendorUserId != null ? String(row.vendorUserId ?? row.VendorUserId) : null,
    serviceId: String(row.serviceId ?? row.ServiceId ?? ""),
    finalAmount: Number(row.finalAmount ?? row.FinalAmount ?? 0),
    status: String(row.status ?? row.Status ?? ""),
    serviceDate: String(row.serviceDate ?? row.ServiceDate ?? ""),
  }));
}

export async function updateBookingStatus(
  token: string,
  bookingId: string,
  status: string
): Promise<void> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookings/${bookingId}/status`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }
  );
  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to update booking status."));
  }
}
