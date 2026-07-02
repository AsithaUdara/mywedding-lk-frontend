import type { VendorShortlistItem, VendorShortlistItemStatus } from "@/shared/lib/api/vendorShortlist";

export function shortlistStatusLabel(
  status: VendorShortlistItemStatus,
  item?: Pick<VendorShortlistItem, "contractFileUrl" | "contractSentAt" | "contractSignedAt">
): string {
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
      if (item?.contractSentAt && !item.contractSignedAt) return "Sign contract";
      if (item?.contractFileUrl && !item.contractSentAt) return "Awaiting contract";
      return "Awaiting contract";
    case "ContractSigned":
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
export function shortlistStatusBadgeKey(
  status: VendorShortlistItemStatus,
  item?: Pick<VendorShortlistItem, "contractFileUrl" | "contractSentAt" | "contractSignedAt">
): string {
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
      if (item?.contractSentAt && !item.contractSignedAt) return "Pending";
      return "AwaitingPayment";
    case "ContractSigned":
      return "AwaitingPayment";
    case "Declined":
      return "Rejected";
    case "DepositPaid":
      return "Confirmed";
    default:
      return status;
  }
}

export function clientNeedsContractSignature(item: VendorShortlistItem): boolean {
  return (
    item.status === "BookingAccepted" &&
    Boolean(item.contractSentAt) &&
    !item.contractSignedAt
  );
}

export function clientCanPayDeposit(item: VendorShortlistItem): boolean {
  return item.status === "ContractSigned" && Boolean(item.vendorBookingId);
}

export function clientAwaitingVendorContract(item: VendorShortlistItem): boolean {
  return item.status === "BookingAccepted" && !item.contractSentAt;
}
