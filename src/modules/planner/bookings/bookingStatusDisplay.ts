import type { BookingFilter } from "@/modules/planner/bookings/plannerBookingHelpers";
import { bookingStatusLozengeClass as themeBookingLozenge } from "@/modules/planner/theme/plannerWorkspaceTheme";

export function formatBookingStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    Requested: "Requested",
    AwaitingPayment: "Awaiting payment",
    Confirmed: "Confirmed",
    Completed: "Completed",
    Cancelled: "Cancelled",
  };
  if (labels[status]) return labels[status];
  return status.replace(/([a-z])([A-Z])/g, "$1 $2");
}

export { PLANNER_BOOKING_STATUS_LOZENGE as BOOKING_STATUS_LOZENGE } from "@/modules/planner/theme/plannerWorkspaceTheme";

export function bookingStatusLozengeClass(status: string): string {
  return themeBookingLozenge(status);
}

export type BookingViewTab = "bookings" | "events";
export type WeddingBookingFilter = "all" | "attention";

export type BookingFilterCounts = Record<BookingFilter, number>;
