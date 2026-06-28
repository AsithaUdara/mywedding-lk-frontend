import type { AdminVendorSummary } from "@/shared/lib/api/admin";
import { kybVendorRef } from "@/modules/admin/dashboard/adminKybHelpers";

export type VendorDirectoryStatusTab = "All" | "Verified" | "Pending" | "Rejected";

export function adminVendorRef(userId: string): string {
  return kybVendorRef(userId);
}

export function formatVendorRegisteredDate(value: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function summaryStatusCounts(
  summary: AdminVendorSummary
): Record<VendorDirectoryStatusTab, number> {
  return {
    All: summary.total,
    Verified: summary.verified,
    Pending: summary.pending,
    Rejected: summary.rejected,
  };
}

export function vendorHasLiveListing(vendor: {
  verificationStatus: string;
  activeServiceCount: number;
}): boolean {
  return vendor.verificationStatus === "Verified" && vendor.activeServiceCount > 0;
}
