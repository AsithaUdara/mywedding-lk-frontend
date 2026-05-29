import type { VendorShortlistItemStatus } from "@/shared/lib/api/vendorShortlist";

export function shortlistStatusLabel(status: VendorShortlistItemStatus): string {
  switch (status) {
    case "Draft":
      return "Draft";
    case "SentToClient":
      return "Awaiting client";
    case "ClientApproved":
      return "Client approved";
    case "ClientRejected":
      return "Declined";
    case "BookingRequested":
      return "Booking requested";
    case "BookingAccepted":
      return "Vendor confirmed";
    default:
      return status;
  }
}

/** Maps to shared StatusBadge keys in `status.ts` */
export function shortlistStatusBadgeKey(status: VendorShortlistItemStatus): string {
  switch (status) {
    case "Draft":
      return "Draft";
    case "SentToClient":
      return "Pending";
    case "ClientApproved":
      return "Approved";
    case "ClientRejected":
      return "Rejected";
    case "BookingRequested":
      return "Requested";
    case "BookingAccepted":
      return "Confirmed";
    default:
      return status;
  }
}
