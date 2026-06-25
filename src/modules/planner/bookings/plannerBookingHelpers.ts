import type { PlannerBookingListItem } from "@/shared/lib/api/planner";
import type { PlannerEventListItem } from "@/shared/lib/api/planner";
import { formatBudgetCompact, formatEventKey } from "@/modules/planner/clients/plannerClientHelpers";

export type BookingFilter = "all" | "action" | "confirmed" | "completed";

export function formatBookingKey(bookingId: string): string {
  return `BKG-${bookingId.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

function normalizeToken(value: string): string {
  return value.replace(/\s+/g, "").toLowerCase();
}

export function bookingNeedsAction(booking: PlannerBookingListItem): boolean {
  const status = normalizeToken(booking.bookingStatus);
  return status === "requested" || status === "awaitingpayment";
}

export function isBookingConfirmed(booking: PlannerBookingListItem): boolean {
  return normalizeToken(booking.bookingStatus) === "confirmed";
}

export function isBookingCompleted(booking: PlannerBookingListItem): boolean {
  return normalizeToken(booking.bookingStatus) === "completed";
}

export function isAwaitingPayment(booking: PlannerBookingListItem): boolean {
  const payment = normalizeToken(booking.paymentStatus);
  return payment === "pending" || normalizeToken(booking.bookingStatus) === "awaitingpayment";
}

export function filterBookings(
  bookings: PlannerBookingListItem[],
  filter: BookingFilter
): PlannerBookingListItem[] {
  switch (filter) {
    case "action":
      return bookings.filter(bookingNeedsAction);
    case "confirmed":
      return bookings.filter(isBookingConfirmed);
    case "completed":
      return bookings.filter(isBookingCompleted);
    default:
      return bookings;
  }
}

export type BookingPortfolioStats = {
  total: number;
  needsAction: number;
  awaitingPayment: number;
  confirmed: number;
  completed: number;
  weddingsWithPending: number;
};

export function computeBookingStats(
  bookings: PlannerBookingListItem[],
  events: PlannerEventListItem[] = []
): BookingPortfolioStats {
  const weddingIds = new Set(
    bookings.filter(bookingNeedsAction).map((b) => b.eventId)
  );

  return {
    total: bookings.length,
    needsAction: bookings.filter(bookingNeedsAction).length,
    awaitingPayment: bookings.filter(isAwaitingPayment).length,
    confirmed: bookings.filter(isBookingConfirmed).length,
    completed: bookings.filter(isBookingCompleted).length,
    weddingsWithPending:
      weddingIds.size > 0
        ? weddingIds.size
        : events.filter((e) => e.requestedBookings > 0).length,
  };
}

export type WeddingBookingSummary = {
  event: PlannerEventListItem;
  eventKey: string;
  pending: number;
  confirmed: number;
  completed: number;
  bookings: PlannerBookingListItem[];
};

export function buildWeddingBookingSummaries(
  events: PlannerEventListItem[],
  bookings: PlannerBookingListItem[]
): WeddingBookingSummary[] {
  return events
    .map((event) => {
      const eventBookings = bookings.filter((b) => b.eventId === event.eventId);
      return {
        event,
        eventKey: formatEventKey(event.eventId),
        pending: event.requestedBookings,
        confirmed: event.confirmedBookings,
        completed: event.completedBookings,
        bookings: eventBookings,
      };
    })
    .filter(
      (summary) =>
        summary.pending > 0 ||
        summary.confirmed > 0 ||
        summary.completed > 0 ||
        summary.bookings.length > 0
    )
    .sort((a, b) => b.pending - a.pending);
}

export function formatBookingAmount(amount: number): string {
  return formatBudgetCompact(amount);
}
