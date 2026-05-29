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
      return "Awaiting vendor";
    case "BookingAccepted":
      return "Pay deposit";
    case "Declined":
      return "Vendor declined";
    case "DepositPaid":
      return "Deposit paid";
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
      return "AwaitingPayment";
    case "Declined":
      return "Rejected";
    case "DepositPaid":
      return "Confirmed";
    default:
      return status;
  }
}
