import type { VendorBookingItem } from "@/shared/lib/api/vendors";

export type BookingQueueFilter =
  | "all"
  | "Requested"
  | "in_progress"
  | "Confirmed"
  | "Completed";

export const BOOKING_QUEUE_FILTERS: { value: BookingQueueFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "Requested", label: "Requests" },
  { value: "in_progress", label: "Payment" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "Completed", label: "Done" },
];

export type BookingQueueStats = {
  requested: number;
  inProgress: number;
  confirmed: number;
  completed: number;
  pipelineValue: number;
};

const IN_PROGRESS_STATUSES = new Set(["AwaitingPayment", "ContractSigned"]);

export function bookingStatusLabel(status: string): string {
  switch (status) {
    case "AwaitingPayment":
      return "Awaiting payment";
    case "ContractSigned":
      return "Contract signed";
    default:
      return status;
  }
}

export function computeBookingQueueStats(bookings: VendorBookingItem[]): BookingQueueStats {
  return bookings.reduce(
    (acc, booking) => {
      if (booking.status === "Requested") acc.requested += 1;
      if (IN_PROGRESS_STATUSES.has(booking.status)) acc.inProgress += 1;
      if (booking.status === "Confirmed") acc.confirmed += 1;
      if (booking.status === "Completed") acc.completed += 1;

      if (
        booking.status === "Requested" ||
        IN_PROGRESS_STATUSES.has(booking.status) ||
        booking.status === "Confirmed"
      ) {
        acc.pipelineValue += booking.finalAmount;
      }

      return acc;
    },
    { requested: 0, inProgress: 0, confirmed: 0, completed: 0, pipelineValue: 0 }
  );
}

export function sortBookingsForQueue(bookings: VendorBookingItem[]): VendorBookingItem[] {
  return [...bookings].sort((a, b) => {
    if (a.status === "Requested" && b.status !== "Requested") return -1;
    if (a.status !== "Requested" && b.status === "Requested") return 1;
    return new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime();
  });
}

export function filterBookingQueue(
  bookings: VendorBookingItem[],
  filter: BookingQueueFilter,
  searchQuery: string
): VendorBookingItem[] {
  let list = [...bookings];
  const query = searchQuery.trim().toLowerCase();

  if (filter === "Requested") {
    list = list.filter((booking) => booking.status === "Requested");
  } else if (filter === "in_progress") {
    list = list.filter((booking) => IN_PROGRESS_STATUSES.has(booking.status));
  } else if (filter === "Confirmed" || filter === "Completed") {
    list = list.filter((booking) => booking.status === filter);
  }

  if (query) {
    list = list.filter(
      (booking) =>
        booking.serviceName.toLowerCase().includes(query) ||
        booking.coupleName.toLowerCase().includes(query) ||
        booking.eventName.toLowerCase().includes(query)
    );
  }

  return sortBookingsForQueue(list);
}

export function formatBookingServiceDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date TBD";
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
