import type { PlannerEventListItem } from "@/shared/lib/api/planner";
import type { VendorShortlistItem } from "@/shared/lib/api/vendorShortlist";
import { countDraftShortlist } from "@/modules/planner/dashboard/plannerDashboardHelpers";

export type ProcurementPortfolioStats = {
  draftProposals: number;
  awaitingClient: number;
  pendingBookings: number;
  confirmedVendors: number;
};

export function countAwaitingClient(items: VendorShortlistItem[]): number {
  return items.filter((item) => item.status === "SentToClient").length;
}

export function countInBookingPipeline(items: VendorShortlistItem[]): number {
  return items.filter((item) =>
    ["ClientApproved", "BookingRequested", "BookingAccepted", "ContractSigned"].includes(
      item.status
    )
  ).length;
}

export function computeProcurementStats(
  events: PlannerEventListItem[],
  allShortlistItems: VendorShortlistItem[]
): ProcurementPortfolioStats {
  return {
    draftProposals: countDraftShortlist(allShortlistItems),
    awaitingClient: countAwaitingClient(allShortlistItems),
    pendingBookings: events.reduce((sum, event) => {
      const requested = event.requestedBookings ?? 0;
      const confirmed = event.confirmedBookings ?? 0;
      return sum + Math.max(0, requested - confirmed);
    }, 0),
    confirmedVendors: events.reduce((sum, event) => sum + (event.confirmedBookings ?? 0), 0),
  };
}

export function shortlistCountsForEvent(items: VendorShortlistItem[]) {
  return {
    total: items.length,
    draft: countDraftShortlist(items),
    awaitingClient: countAwaitingClient(items),
    inPipeline: countInBookingPipeline(items),
  };
}
