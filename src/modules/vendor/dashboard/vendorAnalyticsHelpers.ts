import type { VendorAnalytics, VendorBookingItem, WinRateSummary } from "@/shared/lib/api/vendors";
import { vendorWinRatePct } from "@/modules/vendor/dashboard/vendorDashboardHelpers";

export type VendorEarningsPoint = {
  month: string;
  amount: number;
};

export type BookingStatusSlice = {
  status: string;
  label: string;
  count: number;
};

export type ServicePerformanceRow = {
  serviceName: string;
  bookingCount: number;
  earnedRevenue: number;
  pipelineRevenue: number;
};

const STATUS_LABELS: Record<string, string> = {
  Requested: "Requests",
  AwaitingPayment: "Awaiting payment",
  ContractSigned: "Contract signed",
  Confirmed: "Confirmed",
  Completed: "Completed",
  Cancelled: "Cancelled",
};

const STATUS_CHART_ORDER = [
  "Requested",
  "AwaitingPayment",
  "ContractSigned",
  "Confirmed",
  "Completed",
  "Cancelled",
] as const;

export function parseVendorEarnings(summary: VendorAnalytics | null): VendorEarningsPoint[] {
  return (summary?.monthlyEarnings ?? []).map((row) => ({
    month: row.month,
    amount: Number(row.amount),
  }));
}

export function vendorWinTotal(winRate: WinRateSummary): number {
  return winRate.won + winRate.pending + winRate.lost;
}

export function buildBookingStatusBreakdown(bookings: VendorBookingItem[]): BookingStatusSlice[] {
  const counts = new Map<string, number>();

  for (const booking of bookings) {
    counts.set(booking.status, (counts.get(booking.status) ?? 0) + 1);
  }

  return STATUS_CHART_ORDER.map((status) => ({
    status,
    label: STATUS_LABELS[status] ?? status,
    count: counts.get(status) ?? 0,
  })).filter((slice) => slice.count > 0);
}

export function countOpenBookings(bookings: VendorBookingItem[]): number {
  return bookings.filter((booking) =>
    ["Requested", "AwaitingPayment", "ContractSigned"].includes(booking.status)
  ).length;
}

export function buildServicePerformance(bookings: VendorBookingItem[]): ServicePerformanceRow[] {
  const rows = new Map<string, ServicePerformanceRow>();

  for (const booking of bookings) {
    if (booking.status === "Cancelled") continue;

    const current = rows.get(booking.serviceName) ?? {
      serviceName: booking.serviceName,
      bookingCount: 0,
      earnedRevenue: 0,
      pipelineRevenue: 0,
    };

    current.bookingCount += 1;
    if (booking.status === "Completed") {
      current.earnedRevenue += booking.finalAmount;
    } else if (
      booking.status === "Confirmed" ||
      booking.status === "ContractSigned" ||
      booking.status === "AwaitingPayment"
    ) {
      current.pipelineRevenue += booking.finalAmount;
    }

    rows.set(booking.serviceName, current);
  }

  return [...rows.values()].sort(
    (a, b) =>
      b.earnedRevenue + b.pipelineRevenue - (a.earnedRevenue + a.pipelineRevenue) ||
      b.bookingCount - a.bookingCount
  );
}

export function buildUpcomingBookings(
  bookings: VendorBookingItem[],
  limit = 4
): VendorBookingItem[] {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  return bookings
    .filter((booking) =>
      ["Confirmed", "AwaitingPayment", "ContractSigned"].includes(booking.status)
    )
    .filter((booking) => {
      const date = new Date(booking.serviceDate);
      return !Number.isNaN(date.getTime()) && date >= startOfToday;
    })
    .sort(
      (a, b) =>
        new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime()
    )
    .slice(0, limit);
}

export function isVendorBusinessAnalyticsEmpty(params: {
  summary: VendorAnalytics | null;
  bookings: VendorBookingItem[];
  winRate: WinRateSummary;
}): boolean {
  const { summary, bookings, winRate } = params;
  if (bookings.length > 0 || vendorWinTotal(winRate) > 0) return false;
  if (!summary) return true;

  return (
    summary.totalBookings === 0 &&
    summary.totalRevenue === 0 &&
    summary.pendingRevenue === 0 &&
    summary.totalInquiries === 0
  );
}

export function sumPipelineRevenueFromBookings(bookings: VendorBookingItem[]): number {
  return bookings
    .filter((booking) =>
      ["Confirmed", "ContractSigned", "AwaitingPayment"].includes(booking.status)
    )
    .reduce((sum, booking) => sum + booking.finalAmount, 0);
}

export function sumEarnedRevenueFromBookings(bookings: VendorBookingItem[]): number {
  return bookings
    .filter((booking) => booking.status === "Completed")
    .reduce((sum, booking) => sum + booking.finalAmount, 0);
}

export function vendorCloseRateLabel(winRate: WinRateSummary): {
  label: string;
  value: string;
  hint: string;
} {
  const closed = winRate.won + winRate.lost;

  if (closed === 0) {
    return {
      label: "In progress",
      value: String(winRate.pending),
      hint:
        winRate.pending === 1
          ? "booking awaiting completion"
          : "bookings awaiting completion",
    };
  }

  const pct = Math.round((winRate.won / closed) * 100);
  return {
    label: "Close rate",
    value: `${pct}%`,
    hint: `${winRate.won} won of ${closed} closed`,
  };
}

export function vendorBusinessKpis(params: {
  summary: VendorAnalytics | null;
  bookings: VendorBookingItem[];
  winRate: WinRateSummary;
}) {
  const { summary, bookings, winRate } = params;
  const openBookings = countOpenBookings(bookings);
  const requestedCount = bookings.filter((b) => b.status === "Requested").length;
  const closeRate = vendorCloseRateLabel(winRate);
  const pipelineRevenue = Math.max(
    summary?.pendingRevenue ?? 0,
    sumPipelineRevenueFromBookings(bookings)
  );
  const earnedRevenue = Math.max(
    summary?.totalRevenue ?? 0,
    sumEarnedRevenueFromBookings(bookings)
  );

  return {
    earnedRevenue,
    pipelineRevenue,
    completedBookings: summary?.completedBookings ?? 0,
    confirmedBookings: summary?.confirmedBookings ?? 0,
    openBookings,
    requestedCount,
    unreadInquiries: summary?.unreadInquiries ?? 0,
    totalInquiries: summary?.totalInquiries ?? 0,
    winPct: vendorWinRatePct(winRate),
    winTotal: vendorWinTotal(winRate),
    closeRate,
  };
}
